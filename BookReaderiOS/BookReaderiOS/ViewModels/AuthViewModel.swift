import Foundation
import FirebaseAuth
import FirebaseFirestore
import SwiftUI

@MainActor
class AuthViewModel: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let auth = Auth.auth()
    private let db = Firestore.firestore()
    
    init() {
        setupAuthStateListener()
    }
    
    private func setupAuthStateListener() {
        auth.addStateDidChangeListener { [weak self] _, user in
            Task { @MainActor in
                if let user = user {
                    await self?.fetchUserProfile(userId: user.uid)
                    self?.isAuthenticated = true
                } else {
                    self?.currentUser = nil
                    self?.isAuthenticated = false
                }
            }
        }
    }
    
    func signUp(email: String, password: String, displayName: String, additionalData: [String: Any] = [:]) async throws {
        isLoading = true
        errorMessage = nil
        
        do {
            let result = try await auth.createUser(withEmail: email, password: password)
            
            // Update profile with display name
            let changeRequest = result.user.createProfileChangeRequest()
            changeRequest.displayName = displayName
            try await changeRequest.commitChanges()
            
            // Create user profile in Firestore
            let userData: [String: Any] = [
                "uid": result.user.uid,
                "email": email,
                "displayName": displayName,
                "phone": additionalData["phone"] as? String ?? "",
                "location": additionalData["location"] as? String ?? "",
                "bio": additionalData["bio"] as? String ?? "",
                "createdAt": Timestamp(),
                "subscription": [
                    "plan": "free",
                    "status": "active",
                    "expiresAt": nil
                ],
                "watchHistory": [],
                "favorites": [],
                "preferences": [
                    "language": "en",
                    "quality": "auto",
                    "autoplay": true
                ]
            ]
            
            try await db.collection("users").document(result.user.uid).setData(userData)
            
            // Fetch the created user profile
            await fetchUserProfile(userId: result.user.uid)
            
        } catch {
            errorMessage = error.localizedDescription
            throw error
        } finally {
            isLoading = false
        }
    }
    
    func signIn(email: String, password: String) async throws {
        isLoading = true
        errorMessage = nil
        
        do {
            let result = try await auth.signIn(withEmail: email, password: password)
            await fetchUserProfile(userId: result.user.uid)
        } catch {
            errorMessage = error.localizedDescription
            throw error
        } finally {
            isLoading = false
        }
    }
    
    func signOut() throws {
        do {
            try auth.signOut()
            currentUser = nil
            isAuthenticated = false
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
    
    func resetPassword(email: String) async throws {
        isLoading = true
        errorMessage = nil
        
        do {
            try await auth.sendPasswordReset(withEmail: email)
        } catch {
            errorMessage = error.localizedDescription
            throw error
        } finally {
            isLoading = false
        }
    }
    
    private func fetchUserProfile(userId: String) async {
        do {
            let document = try await db.collection("users").document(userId).getDocument()
            if let user = User(document: document) {
                currentUser = user
            }
        } catch {
            print("Error fetching user profile: \(error)")
        }
    }
    
    func updateUserProfile(updates: [String: Any]) async throws {
        guard let userId = currentUser?.id else { return }
        
        do {
            try await db.collection("users").document(userId).updateData(updates)
            await fetchUserProfile(userId: userId)
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
}
