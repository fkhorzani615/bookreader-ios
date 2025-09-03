# 🚀 **Testing iOS Project in GitHub Codespaces**

## **Overview**
This guide explains how to test your iOS BookReader app in GitHub Codespaces using different methods.

## **Method 1: GitHub Codespaces with iOS Simulator (Recommended)**

### **Step 1: Launch Codespaces**
1. Go to: `https://github.com/fkhorzani615/bookreader_ios`
2. Click **"Code"** → **"Codespaces"** tab
3. Click **"Create codespace on main"**
4. Wait for the environment to build (5-10 minutes)

### **Step 2: Access iOS Simulator**
Once in Codespaces:
1. **Browser-based Simulator**: Some Codespaces support iOS simulators in the browser
2. **Command Line Testing**: Use Swift commands to test functionality
3. **Xcode Integration**: If available, open project in Xcode

## **Method 2: Command Line Testing in Codespaces**

### **Test Swift Compilation**
```bash
# Navigate to project
cd BookReaderios

# Test Swift compilation
swift build

# Test specific files
swift -frontend -parse BookReaderiosApp.swift
```

### **Test Firebase Connection**
```bash
# Run the setup script
chmod +x .devcontainer/setup-ios.sh
./.devcontainer/setup-ios.sh
```

## **Method 3: Local Xcode with Codespaces Sync**

### **Step 1: Clone Repository Locally**
```bash
git clone https://github.com/fkhorzani615/bookreader_ios.git
cd bookreader_ios
```

### **Step 2: Open in Xcode**
```bash
# Open the project
open BookReaderios/BookReaderios.xcodeproj
```

### **Step 3: Run in iOS Simulator**
1. Select a simulator (iPhone 15, iPad, etc.)
2. Click **Run** button (▶️)
3. Test Firebase connection using the built-in test view

## **Method 4: Firebase Testing Without Simulator**

### **Test Firebase Services**
The app includes a Firebase test view that you can test:

1. **Console Logging**: Check Xcode console for Firebase status
2. **UI Testing**: Use the Firebase Test button in Profile view
3. **Service Validation**: Test Auth, Firestore, and Storage

### **Console Output Example**
```
🔥 Firebase configured successfully
🔍 Testing Firebase services...
✅ Auth service: Available
✅ Firestore service: Available
✅ Storage service: Available
🎯 Firebase test completed!
```

## **Troubleshooting**

### **Common Issues**

#### **1. Firebase CLI Login Failed**
```bash
# Clear cache and retry
firebase logout
firebase login --no-localhost
```

#### **2. Simulator Not Available**
- Use command line testing
- Test Firebase services through console
- Use local Xcode installation

#### **3. Build Errors**
```bash
# Clean and rebuild
swift package clean
swift build
```

## **Testing Checklist**

- [ ] **Firebase Connection**: App launches without Firebase errors
- [ ] **Authentication**: Sign up/login functionality works
- [ ] **Database**: Can read/write to Firestore
- [ ] **Storage**: File upload/download works
- [ ] **UI Components**: All views render correctly
- [ ] **Navigation**: Tab navigation works properly

## **Next Steps**

1. **Launch GitHub Codespaces** for cloud development
2. **Test Firebase services** using the built-in test view
3. **Use local Xcode** for full simulator testing
4. **Deploy to TestFlight** for device testing

## **Support**

- **GitHub Issues**: Report problems in the repository
- **Firebase Console**: Check project status and logs
- **Xcode Console**: Monitor app logs and errors

---

**Happy Testing! 🎉**
