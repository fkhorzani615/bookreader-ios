import SwiftUI

struct VideoCard: View {
    let video: Video
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Thumbnail with Play Button
            ZStack {
                AsyncImage(url: URL(string: video.thumbnailUrl)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .overlay(
                            Image(systemName: "play.rectangle")
                                .font(.system(size: 40))
                                .foregroundColor(.gray)
                        )
                }
                .frame(width: 160, height: 90)
                .clipped()
                .cornerRadius(12)
                
                // Play Button Overlay
                Circle()
                    .fill(Color.white.opacity(0.9))
                    .frame(width: 40, height: 40)
                    .overlay(
                        Image(systemName: "play.fill")
                            .font(.system(size: 16))
                            .foregroundColor(.blue)
                    )
                
                // Duration Badge
                VStack {
                    HStack {
                        Spacer()
                        Text(video.duration)
                            .font(.caption2)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.black.opacity(0.7))
                            .cornerRadius(8)
                    }
                    Spacer()
                }
                .frame(width: 160, height: 90)
            }
            
            // Video Info
            VStack(alignment: .leading, spacing: 4) {
                Text(video.title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
                
                Text(video.category)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                
                HStack(spacing: 8) {
                    // Rating
                    HStack(spacing: 2) {
                        Image(systemName: "star.fill")
                            .font(.caption2)
                            .foregroundColor(.yellow)
                        
                        Text(String(format: "%.1f", video.rating))
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    
                    // Views
                    HStack(spacing: 2) {
                        Image(systemName: "eye")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        
                        Text("\(video.views)")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            }
            .frame(width: 160)
        }
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

struct VideoCardLarge: View {
    let video: Video
    
    var body: some View {
        HStack(spacing: 16) {
            // Thumbnail
            ZStack {
                AsyncImage(url: URL(string: video.thumbnailUrl)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .overlay(
                            Image(systemName: "play.rectangle")
                                .font(.system(size: 30))
                                .foregroundColor(.gray)
                        )
                }
                .frame(width: 120, height: 80)
                .clipped()
                .cornerRadius(8)
                
                // Play Button Overlay
                Circle()
                    .fill(Color.white.opacity(0.9))
                    .frame(width: 32, height: 32)
                    .overlay(
                        Image(systemName: "play.fill")
                            .font(.system(size: 14))
                            .foregroundColor(.blue)
                    )
            }
            
            // Video Info
            VStack(alignment: .leading, spacing: 8) {
                Text(video.title)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
                
                Text(video.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(3)
                    .multilineTextAlignment(.leading)
                
                HStack(spacing: 16) {
                    // Duration
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Text(video.duration)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    // Rating
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.caption)
                            .foregroundColor(.yellow)
                        
                        Text(String(format: "%.1f", video.rating))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    // Views
                    HStack(spacing: 4) {
                        Image(systemName: "eye")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Text("\(video.views)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            Spacer()
        }
        .padding(16)
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

#Preview {
    VStack(spacing: 20) {
        VideoCard(video: Video(
            id: "1",
            title: "SwiftUI Tutorial for Beginners",
            description: "Learn the basics of SwiftUI framework",
            category: "Programming",
            videoUrl: "https://example.com/video.mp4",
            thumbnailUrl: "https://example.com/thumbnail.jpg",
            duration: "15:30",
            rating: 4.7,
            views: 2500
        ))
        
        VideoCardLarge(video: Video(
            id: "2",
            title: "Building iOS Apps with SwiftUI",
            description: "Complete guide to building iOS applications using SwiftUI framework",
            category: "Programming",
            videoUrl: "https://example.com/video2.mp4",
            thumbnailUrl: "https://example.com/thumbnail2.jpg",
            duration: "45:20",
            rating: 4.9,
            views: 1800
        ))
    }
    .padding()
}
