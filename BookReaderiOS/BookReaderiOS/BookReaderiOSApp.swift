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
        print("Firebase configured successfully")
    }
}

