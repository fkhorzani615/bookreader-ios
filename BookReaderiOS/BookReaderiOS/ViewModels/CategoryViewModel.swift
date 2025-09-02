import Foundation
import FirebaseFirestore
import SwiftUI

@MainActor
class CategoryViewModel: ObservableObject {
    @Published var categories: [Category] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let db = Firestore.firestore()
    
    init() {
        Task {
            await fetchCategories()
        }
    }
    
    func fetchCategories() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let query = db.collection("categories")
                .whereField("isActive", isEqualTo: true)
                .order(by: "name")
            
            let snapshot = try await query.getDocuments()
            let fetchedCategories = snapshot.documents.compactMap { Category(document: $0) }
            
            categories = fetchedCategories
            
        } catch {
            errorMessage = error.localizedDescription
            print("Error fetching categories: \(error)")
            
            // Fallback to default categories if Firebase fails
            categories = getDefaultCategories()
        } finally {
            isLoading = false
        }
    }
    
    private func getDefaultCategories() -> [Category] {
        return [
            Category(id: "programming", name: "Programming", description: "Programming and software development", icon: "laptopcomputer", color: "#FF6B6B"),
            Category(id: "data-science", name: "Data Science", description: "Machine learning and data analysis", icon: "chart.bar", color: "#4ECDC4"),
            Category(id: "design", name: "Design", description: "UI/UX and graphic design", icon: "paintbrush", color: "#45B7D1"),
            Category(id: "business", name: "Business", description: "Business and entrepreneurship", icon: "briefcase", color: "#96CEB4"),
            Category(id: "marketing", name: "Marketing", description: "Digital marketing strategies", icon: "megaphone", color: "#FFEAA7"),
            Category(id: "lifestyle", name: "Lifestyle", description: "Health and personal development", icon: "heart", color: "#DDA0DD"),
            Category(id: "technology", name: "Technology", description: "Latest tech trends", icon: "gear", color: "#98D8C8"),
            Category(id: "education", name: "Education", description: "Learning and skill development", icon: "book", color: "#F7DC6F")
        ]
    }
    
    func getCategoryByName(_ name: String) -> Category? {
        return categories.first { $0.name == name }
    }
    
    func getCategoryColor(_ categoryName: String) -> String {
        if let category = getCategoryByName(categoryName) {
            return category.color
        }
        return "#007AFF" // Default blue color
    }
    
    func getCategoryIcon(_ categoryName: String) -> String {
        if let category = getCategoryByName(categoryName) {
            return category.icon
        }
        return "book" // Default icon
    }
}
