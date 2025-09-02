import SwiftUI
import Firebase
import FirebaseAuth
import FirebaseFirestore

@main
struct BookReaderiOSApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    @StateObject private var bookViewModel = BookViewModel()
    @StateObject private var videoViewModel = VideoViewModel()
    @StateObject private var categoryViewModel = CategoryViewModel()
    
    init() {
        FirebaseApp.configure()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authViewModel)
                .environmentObject(bookViewModel)
                .environmentObject(videoViewModel)
                .environmentObject(categoryViewModel)
                .onAppear {
                    // Set up Firebase configuration
                    setupFirebase()
                }
        }
    }
    
    private func setupFirebase() {
        // Firebase is already configured in init()
        print("🔥 Firebase configured successfully")
        
        // Test Firebase services
        testFirebaseServices()
    }
    
    private func testFirebaseServices() {
        print("🔍 Testing Firebase services...")
        
        // Test Auth
        let auth = Auth.auth()
        print("✅ Auth service: \(auth.app != nil ? "Available" : "Failed")")
        
        // Test Firestore
        let db = Firestore.firestore()
        print("✅ Firestore service: \(db.app != nil ? "Available" : "Failed")")
        
        // Test Storage
        let storage = Storage.storage()
        print("✅ Storage service: \(storage.app != nil ? "Available" : "Failed")")
        
        print("🎯 Firebase test completed!")
    }
}

