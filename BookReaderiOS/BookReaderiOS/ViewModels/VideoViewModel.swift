import Foundation
import FirebaseFirestore
import SwiftUI

@MainActor
class VideoViewModel: ObservableObject {
    @Published var videos: [Video] = []
    @Published var featuredVideos: [Video] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let db = Firestore.firestore()
    
    init() {
        Task {
            await fetchVideos()
        }
    }
    
    func fetchVideos() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let query = db.collection("videos")
                .whereField("isPublic", isEqualTo: true)
                .order(by: "createdAt", descending: true)
            
            let snapshot = try await query.getDocuments()
            let fetchedVideos = snapshot.documents.compactMap { Video(document: $0) }
            
            videos = fetchedVideos
            featuredVideos = fetchedVideos.filter { $0.featured }
            
        } catch {
            errorMessage = error.localizedDescription
            print("Error fetching videos: \(error)")
        } finally {
            isLoading = false
        }
    }
    
    func fetchVideosByCategory(_ category: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let query = db.collection("videos")
                .whereField("isPublic", isEqualTo: true)
                .whereField("category", isEqualTo: category)
                .order(by: "createdAt", descending: true)
            
            let snapshot = try await query.getDocuments()
            let fetchedVideos = snapshot.documents.compactMap { Video(document: $0) }
            
            videos = fetchedVideos
            
        } catch {
            errorMessage = error.localizedDescription
            print("Error fetching videos by category: \(error)")
        } finally {
            isLoading = false
        }
    }
    
    func searchVideos(query: String) async {
        guard !query.isEmpty else {
            await fetchVideos()
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let queryLower = query.lowercased()
            let filteredVideos = videos.filter { video in
                video.title.lowercased().contains(queryLower) ||
                video.description.lowercased().contains(queryLower) ||
                video.tags.contains { $0.lowercased().contains(queryLower) }
            }
            
            videos = filteredVideos
            
        } catch {
            errorMessage = error.localizedDescription
            print("Error searching videos: \(error)")
        } finally {
            isLoading = false
        }
    }
    
    func addVideo(_ video: Video) async throws {
        do {
            let videoData: [String: Any] = [
                "title": video.title,
                "description": video.description,
                "category": video.category,
                "videoUrl": video.videoUrl,
                "thumbnailUrl": video.thumbnailUrl,
                "duration": video.duration,
                "isPublic": video.isPublic,
                "featured": video.featured,
                "views": video.views,
                "likes": video.likes,
                "tags": video.tags,
                "userId": video.userId,
                "createdAt": Timestamp(),
                "updatedAt": Timestamp(),
                "language": video.language,
                "rating": video.rating,
                "reviews": video.reviews
            ]
            
            try await db.collection("videos").addDocument(data: videoData)
            await fetchVideos()
            
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
    
    func updateVideo(_ video: Video) async throws {
        do {
            let videoData: [String: Any] = [
                "title": video.title,
                "description": video.description,
                "category": video.category,
                "videoUrl": video.videoUrl,
                "thumbnailUrl": video.thumbnailUrl,
                "duration": video.duration,
                "isPublic": video.isPublic,
                "featured": video.featured,
                "views": video.views,
                "likes": video.likes,
                "tags": video.tags,
                "updatedAt": Timestamp(),
                "language": video.language,
                "rating": video.rating,
                "reviews": video.reviews
            ]
            
            try await db.collection("videos").document(video.id).updateData(videoData)
            await fetchVideos()
            
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
    
    func deleteVideo(_ videoId: String) async throws {
        do {
            try await db.collection("videos").document(videoId).delete()
            await fetchVideos()
            
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
    
    func incrementVideoViews(_ videoId: String) async {
        do {
            try await db.collection("videos").document(videoId).updateData([
                "views": FieldValue.increment(Int64(1))
            ])
        } catch {
            print("Error incrementing video views: \(error)")
        }
    }
    
    func toggleVideoLike(_ videoId: String, userId: String) async {
        // Implementation for toggling video likes
        // This would require updating both the video document and user's favorites
    }
    
    func getVideoById(_ videoId: String) -> Video? {
        return videos.first { $0.id == videoId }
    }
}
