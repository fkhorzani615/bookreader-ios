import Foundation
import FirebaseFirestore

struct User: Identifiable, Codable {
    let id: String
    let email: String
    let displayName: String
    let phone: String
    let location: String
    let bio: String
    let createdAt: Date
    let subscription: Subscription
    let watchHistory: [String]
    let favorites: [String]
    let preferences: UserPreferences
    
    init(id: String, email: String, displayName: String, phone: String = "", location: String = "", bio: String = "", createdAt: Date = Date(), subscription: Subscription = Subscription(), watchHistory: [String] = [], favorites: [String] = [], preferences: UserPreferences = UserPreferences()) {
        self.id = id
        self.email = email
        self.displayName = displayName
        self.phone = phone
        self.location = location
        self.bio = bio
        self.createdAt = createdAt
        self.subscription = subscription
        self.watchHistory = watchHistory
        self.favorites = favorites
        self.preferences = preferences
    }
    
    init?(document: DocumentSnapshot) {
        guard let data = document.data() else { return nil }
        
        self.id = document.documentID
        self.email = data["email"] as? String ?? ""
        self.displayName = data["displayName"] as? String ?? ""
        self.phone = data["phone"] as? String ?? ""
        self.location = data["location"] as? String ?? ""
        self.bio = data["bio"] as? String ?? ""
        self.watchHistory = data["watchHistory"] as? [String] ?? []
        self.favorites = data["favorites"] as? [String] ?? []
        
        if let subscriptionData = data["subscription"] as? [String: Any] {
            self.subscription = Subscription(
                plan: subscriptionData["plan"] as? String ?? "free",
                status: subscriptionData["status"] as? String ?? "active",
                expiresAt: (subscriptionData["expiresAt"] as? Timestamp)?.dateValue()
            )
        } else {
            self.subscription = Subscription()
        }
        
        if let preferencesData = data["preferences"] as? [String: Any] {
            self.preferences = UserPreferences(
                language: preferencesData["language"] as? String ?? "en",
                quality: preferencesData["quality"] as? String ?? "auto",
                autoplay: preferencesData["autoplay"] as? Bool ?? true
            )
        } else {
            self.preferences = UserPreferences()
        }
        
        if let timestamp = data["createdAt"] as? Timestamp {
            self.createdAt = timestamp.dateValue()
        } else {
            self.createdAt = Date()
        }
    }
}

struct Subscription: Codable {
    let plan: String
    let status: String
    let expiresAt: Date?
    
    init(plan: String = "free", status: String = "active", expiresAt: Date? = nil) {
        self.plan = plan
        self.status = status
        self.expiresAt = expiresAt
    }
}

struct UserPreferences: Codable {
    let language: String
    let quality: String
    let autoplay: Bool
    
    init(language: String = "en", quality: String = "auto", autoplay: Bool = true) {
        self.language = language
        self.quality = quality
        self.autoplay = autoplay
    }
}
