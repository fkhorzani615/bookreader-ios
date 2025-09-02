import Foundation
import FirebaseFirestore

struct Category: Identifiable, Codable {
    let id: String
    let name: String
    let description: String
    let icon: String
    let color: String
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
    
    init(id: String, name: String, description: String, icon: String, color: String, isActive: Bool = true, createdAt: Date = Date(), updatedAt: Date = Date()) {
        self.id = id
        self.name = name
        self.description = description
        self.icon = icon
        self.color = color
        self.isActive = isActive
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
    
    init?(document: DocumentSnapshot) {
        guard let data = document.data() else { return nil }
        
        self.id = document.documentID
        self.name = data["name"] as? String ?? ""
        self.description = data["description"] as? String ?? ""
        self.icon = data["icon"] as? String ?? ""
        self.color = data["color"] as? String ?? "#007AFF"
        self.isActive = data["isActive"] as? Bool ?? true
        
        if let timestamp = data["createdAt"] as? Timestamp {
            self.createdAt = timestamp.dateValue()
        } else {
            self.createdAt = Date()
        }
        
        if let timestamp = data["updatedAt"] as? Timestamp {
            self.updatedAt = timestamp.dateValue()
        } else {
            self.updatedAt = Date()
        }
    }
}
