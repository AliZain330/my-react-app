# Firebase Functions Deployment Checklist

## Step 1: Update and Install Dependencies
```bash
cd functions
.\venv\Scripts\Activate.ps1  # or venv\Scripts\activate.bat for CMD
pip install --upgrade -r requirements.txt
```

## Step 2: Verify Function Syntax
```bash
python -m py_compile main.py
```

## Step 3: Check Firebase CLI Login
```bash
firebase login
firebase projects:list
```

## Step 4: Verify Project Configuration
```bash
# Should show: my-react-app-899b1
firebase use
```

## Step 5: Deploy with Verbose Output
```bash
firebase deploy --only functions --debug
```

## Step 6: Check Firebase Console
- Go to: https://console.firebase.google.com/project/my-react-app-899b1/functions
- Look for: `on_request_example` function

## Common Issues:
1. **Function not appearing**: Check deployment logs for errors
2. **Python version mismatch**: Ensure Python 3.13 is used
3. **Missing dependencies**: Reinstall from requirements.txt
4. **Authentication issues**: Run `firebase login` again
5. **Billing not enabled**: Enable billing in Firebase Console

