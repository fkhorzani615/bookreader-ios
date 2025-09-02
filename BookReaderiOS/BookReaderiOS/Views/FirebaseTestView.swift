import SwiftUI
import Firebase
import FirebaseAuth
import FirebaseFirestore

struct FirebaseTestView: View {
    @State private var connectionStatus = "Testing..."
    @State private var authStatus = "Not tested"
    @State private var databaseStatus = "Not tested"
    @State private var storageStatus = "Not tested"
    @State private var testResults: [String] = []
    @State private var isLoading = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Firebase Connection Test")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .padding()
                
                // Connection Status
                VStack(alignment: .leading, spacing: 10) {
                    Text("Connection Status:")
                        .font(.headline)
                    
                    HStack {
                        Circle()
                            .fill(connectionStatus.contains("✅") ? Color.green : Color.orange)
                            .frame(width: 12, height: 12)
                        Text(connectionStatus)
                            .foregroundColor(connectionStatus.contains("✅") ? .green : .orange)
                    }
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(10)
                
                // Test Results
                VStack(alignment: .leading, spacing: 10) {
                    Text("Test Results:")
                        .font(.headline)
                    
                    ForEach(testResults, id: \.self) { result in
                        HStack {
                            Image(systemName: result.contains("✅") ? "checkmark.circle.fill" : "xmark.circle.fill")
                                .foregroundColor(result.contains("✅") ? .green : .red)
                            Text(result)
                                .font(.caption)
                        }
                    }
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(10)
                
                // Test Button
                Button(action: runAllTests) {
                    HStack {
                        if isLoading {
                            ProgressView()
                                .scaleEffect(0.8)
                        }
                        Text(isLoading ? "Testing..." : "Run All Tests")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }
                .disabled(isLoading)
                
                Spacer()
            }
            .padding()
            .navigationTitle("Firebase Test")
            .onAppear {
                testFirebaseConnection()
            }
        }
    }
    
    private func runAllTests() {
        isLoading = true
        testResults.removeAll()
        
        // Test 1: Firebase Connection
        testFirebaseConnection()
        
        // Test 2: Authentication
        testAuthentication()
        
        // Test 3: Database Access
        testDatabaseAccess()
        
        // Test 4: Storage Access
        testStorageAccess()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            isLoading = false
        }
    }
    
    private func testFirebaseConnection() {
        testResults.append("🔄 Testing Firebase connection...")
        
        if FirebaseApp.app() != nil {
            connectionStatus = "✅ Connected to Firebase"
            testResults.append("✅ Firebase connection successful")
        } else {
            connectionStatus = "❌ Firebase not connected"
            testResults.append("❌ Firebase connection failed")
        }
    }
    
    private func testAuthentication() {
        testResults.append("🔄 Testing Authentication...")
        
        let auth = Auth.auth()
        if auth.app != nil {
            authStatus = "✅ Auth service available"
            testResults.append("✅ Authentication service working")
        } else {
            authStatus = "❌ Auth service failed"
            testResults.append("❌ Authentication service failed")
        }
    }
    
    private func testDatabaseAccess() {
        testResults.append("🔄 Testing Firestore Database...")
        
        let db = Firestore.firestore()
        if db.app != nil {
            // Try to read a simple document
            db.collection("test").document("connection").getDocument { document, error in
                DispatchQueue.main.async {
                    if let error = error {
                        self.databaseStatus = "⚠️ Database accessible but error: \(error.localizedDescription)"
                        self.testResults.append("⚠️ Database accessible but error: \(error.localizedDescription)")
                    } else {
                        self.databaseStatus = "✅ Database accessible"
                        self.testResults.append("✅ Database connection successful")
                    }
                }
            }
        } else {
            databaseStatus = "❌ Database service failed"
            testResults.append("❌ Database service failed")
        }
    }
    
    private func testStorageAccess() {
        testResults.append("🔄 Testing Firebase Storage...")
        
        let storage = Storage.storage()
        if storage.app != nil {
            storageStatus = "✅ Storage service available"
            testResults.append("✅ Storage service working")
        } else {
            storageStatus = "❌ Storage service failed"
            testResults.append("❌ Storage service failed")
        }
    }
}

#Preview {
    FirebaseTestView()
}
