import Foundation
import FirebaseFirestore

struct Book: Identifiable, Codable {
    let id: String
    let title: String
    let description: String
    let author: String
    let category: String
    let coverImageUrl: String
    let pdfUrl: String
    let isPublic: Bool
    let featured: Bool
    let views: Int
    let likes: Int
    let tags: [String]
    let userId: String
    let createdAt: Date
    let updatedAt: Date
    let language: String
    let pages: Int
    let rating: Double
    let reviews: Int
    
    init(id: String, title: String, description: String, author: String, category: String, coverImageUrl: String, pdfUrl: String, isPublic: Bool = true, featured: Bool = false, views: Int = 0, likes: Int = 0, tags: [String] = [], userId: String = "", createdAt: Date = Date(), updatedAt: Date = Date(), language: String = "en", pages: Int = 0, rating: Double = 0.0, reviews: Int = 0) {
        self.id = id
        self.title = title
        self.description = description
        self.author = author
        self.category = category
        self.coverImageUrl = coverImageUrl
        self.pdfUrl = pdfUrl
        self.isPublic = isPublic
        self.featured = featured
        self.views = views
        self.likes = likes
        self.tags = tags
        self.userId = userId
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.language = language
        self.pages = pages
        self.rating = rating
        self.reviews = reviews
    }
    
    init?(document: DocumentSnapshot) {
        guard let data = document.data() else { return nil }
        
        self.id = document.documentID
        self.title = data["title"] as? String ?? ""
        self.description = data["description"] as? String ?? ""
        self.author = data["author"] as? String ?? ""
        self.category = data["category"] as? String ?? ""
        self.coverImageUrl = data["coverImageUrl"] as? String ?? ""
        self.pdfUrl = data["pdfUrl"] as? String ?? ""
        self.isPublic = data["isPublic"] as? Bool ?? true
        self.featured = data["featured"] as? Bool ?? false
        self.views = data["views"] as? Int ?? 0
        self.likes = data["likes"] as? Int ?? 0
        self.tags = data["tags"] as? [String] ?? []
        self.userId = data["userId"] as? String ?? ""
        self.language = data["language"] as? String ?? "en"
        self.pages = data["pages"] as? Int ?? 0
        self.rating = data["rating"] as? Double ?? 0.0
        self.reviews = data["reviews"] as? Int ?? 0
        
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
