# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn  # type: ignore
from firebase_functions.options import set_global_options  # type: ignore
from firebase_admin import initialize_app  # type: ignore
import httpx  # type: ignore
import os

# For cost control, you can set the maximum number of containers that can be
# running at the same time. This helps mitigate the impact of unexpected
# traffic spikes by instead downgrading performance. This limit is a per-function
# limit. You can override the limit for each function using the max_instances
# parameter in the decorator, e.g. @https_fn.on_request(max_instances=5).
set_global_options(max_instances=10)

initialize_app()


@https_fn.on_call()
def get_timestamps(req: https_fn.CallableRequest) -> dict:
    """
    HTTP callable function that generates chapter markers/timestamps for YouTube videos
    using the Bumpups API.
    
    Expected input from frontend:
    {
        "url": "https://www.youtube.com/watch?v=..."
    }
    """
    # Bumpups API key - get from environment variable
    # For Python Firebase Functions, config values set via firebase functions:config:set
    # are available as environment variables. The config "bumpups.api_key" should be
    # available, but we'll check multiple possible formats
    api_key = (
        os.environ.get("BUMPUPS_API_KEY") or  # Direct env var
        os.environ.get("bumpups_api_key") or  # Config format (dots to underscores, lowercase)
        "bumpups-vouOtPSqaVRKLbjmNOOGXnMImE23261QAUNNcdfokJ8xQ6b2bU0WKGu0Ln-QCCqGjS0Q-27o38VulFjfPQyHJwUofB8j5Fw7a4iGazfuiGfGIBRYhbbiYbVNXFaRZCmf2RTjm90ZUx4bMZqwAXai2AuviInkg2VDhg"  # Fallback
    )
    
    # Get YouTube URL from request
    if not req.data or "url" not in req.data:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="YouTube URL is required"
        )
    
    youtube_url = req.data["url"]
    
    # Validate URL format (basic check)
    if not youtube_url or not isinstance(youtube_url, str):
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Invalid YouTube URL format"
        )
    
    # Prepare request to Bumpups API
    bumpups_url = "https://api.bumpups.com/general/timestamps"
    headers = {
        "Content-Type": "application/json",
        "X-Api-Key": api_key
    }
    payload = {
        "url": youtube_url,
        "model": "bump-1.0",
        "language": "en",
        "timestamps_style": "long"
    }
    
    try:
        # Make request to Bumpups API
        with httpx.Client(timeout=300.0) as client:  # 5 minute timeout for long videos
            response = client.post(
                bumpups_url,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            
            return {
                "success": True,
                "data": result
            }
    
    except httpx.HTTPStatusError as e:
        error_message = f"Bumpups API error: {e.response.status_code}"
        try:
            error_data = e.response.json()
            if "message" in error_data:
                error_message = error_data["message"]
        except:
            pass
        
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=error_message
        )
    
    except httpx.TimeoutException:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.DEADLINE_EXCEEDED,
            message="Request to Bumpups API timed out"
        )
    
    except Exception as e:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=f"Failed to fetch timestamps: {str(e)}"
        )