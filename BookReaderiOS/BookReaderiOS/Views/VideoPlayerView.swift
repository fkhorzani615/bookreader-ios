import SwiftUI
import AVKit

struct VideoPlayerView: View {
    let video: Video
    @EnvironmentObject var videoViewModel: VideoViewModel
    @State private var player: AVPlayer?
    @State private var isPlaying = false
    @State private var currentTime: Double = 0
    @State private var duration: Double = 0
    @State private var showingControls = true
    @State private var isFullscreen = false
    
    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                // Video Player
                ZStack {
                    if let player = player {
                        VideoPlayer(player: player)
                            .aspectRatio(16/9, contentMode: .fit)
                            .onTapGesture {
                                withAnimation(.easeInOut(duration: 0.3)) {
                                    showingControls.toggle()
                                }
                            }
                    } else {
                        // Placeholder
                        Rectangle()
                            .fill(Color.black)
                            .aspectRatio(16/9, contentMode: .fit)
                            .overlay(
                                VStack(spacing: 16) {
                                    Image(systemName: "play.rectangle")
                                        .font(.system(size: 60))
                                        .foregroundColor(.white)
                                    
                                    Text("Video Player")
                                        .font(.title2)
                                        .foregroundColor(.white)
                                }
                            )
                    }
                    
                    // Video Controls Overlay
                    if showingControls {
                        VideoControlsOverlay(
                            isPlaying: $isPlaying,
                            currentTime: $currentTime,
                            duration: $duration,
                            onPlayPause: togglePlayPause,
                            onSeek: seekTo,
                            onFullscreen: toggleFullscreen
                        )
                    }
                }
                
                // Video Information
                VideoInfoView(video: video)
                
                // Related Videos
                RelatedVideosView()
            }
        }
        .navigationTitle("Video Player")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarHidden(isFullscreen)
        .statusBarHidden(isFullscreen)
        .onAppear {
            setupPlayer()
            Task {
                await videoViewModel.incrementVideoViews(video.id)
            }
        }
        .onDisappear {
            cleanupPlayer()
        }
    }
    
    private func setupPlayer() {
        guard let url = URL(string: video.videoUrl) else { return }
        
        player = AVPlayer(url: url)
        
        // Add time observer
        let interval = CMTime(seconds: 0.5, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
        let timeObserver = player?.addPeriodicTimeObserver(forInterval: interval, queue: .main) { time in
            currentTime = time.seconds
        }
        
        // Get duration
        let asset = AVAsset(url: url)
        asset.loadValuesAsynchronously(forKeys: ["duration"]) {
            DispatchQueue.main.async {
                if let duration = try? asset.loadTracks(withMediaType: .video).first?.load(.timeRange).duration {
                    self.duration = CMTimeGetSeconds(duration)
                }
            }
        }
    }
    
    private func cleanupPlayer() {
        player?.pause()
        player = nil
    }
    
    private func togglePlayPause() {
        if isPlaying {
            player?.pause()
        } else {
            player?.play()
        }
        isPlaying.toggle()
    }
    
    private func seekTo(_ time: Double) {
        let targetTime = CMTime(seconds: time, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
        player?.seek(to: targetTime)
        currentTime = time
    }
    
    private func toggleFullscreen() {
        isFullscreen.toggle()
    }
}

struct VideoControlsOverlay: View {
    @Binding var isPlaying: Bool
    @Binding var currentTime: Double
    @Binding var duration: Double
    let onPlayPause: () -> Void
    let onSeek: (Double) -> Void
    let onFullscreen: () -> Void
    
    var body: some View {
        VStack {
            // Top controls
            HStack {
                Spacer()
                
                Button(action: onFullscreen) {
                    Image(systemName: "arrow.up.left.and.arrow.down.right")
                        .font(.title2)
                        .foregroundColor(.white)
                        .padding(12)
                        .background(Color.black.opacity(0.6))
                        .clipShape(Circle())
                }
            }
            .padding()
            
            Spacer()
            
            // Center play button
            Button(action: onPlayPause) {
                Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                    .font(.system(size: 50))
                    .foregroundColor(.white)
                    .padding(20)
                    .background(Color.black.opacity(0.6))
                    .clipShape(Circle())
            }
            
            Spacer()
            
            // Bottom controls
            VStack(spacing: 16) {
                // Progress bar
                ProgressSlider(
                    currentTime: currentTime,
                    duration: duration,
                    onSeek: onSeek
                )
                
                // Time and controls
                HStack {
                    Text(formatTime(currentTime))
                        .font(.caption)
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    HStack(spacing: 20) {
                        Button(action: {
                            let newTime = max(0, currentTime - 10)
                            onSeek(newTime)
                        }) {
                            Image(systemName: "gobackward.10")
                                .font(.title3)
                                .foregroundColor(.white)
                        }
                        
                        Button(action: onPlayPause) {
                            Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                                .font(.title2)
                                .foregroundColor(.white)
                        }
                        
                        Button(action: {
                            let newTime = min(duration, currentTime + 10)
                            onSeek(newTime)
                        }) {
                            Image(systemName: "goforward.10")
                                .font(.title3)
                                .foregroundColor(.white)
                        }
                    }
                    
                    Spacer()
                    
                    Text(formatTime(duration))
                        .font(.caption)
                        .foregroundColor(.white)
                }
            }
            .padding()
            .background(
                LinearGradient(
                    colors: [Color.clear, Color.black.opacity(0.7)],
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
        }
    }
    
    private func formatTime(_ time: Double) -> String {
        let minutes = Int(time) / 60
        let seconds = Int(time) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

struct ProgressSlider: View {
    let currentTime: Double
    let duration: Double
    let onSeek: (Double) -> Void
    @State private var isDragging = false
    
    var body: some View {
        VStack(spacing: 8) {
            Slider(
                value: Binding(
                    get: { currentTime },
                    set: { onSeek($0) }
                ),
                in: 0...max(duration, 1),
                onEditingChanged: { editing in
                    isDragging = editing
                }
            )
            .accentColor(.white)
            
            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.white.opacity(0.3))
                        .frame(height: 3)
                    
                    Rectangle()
                        .fill(Color.white)
                        .frame(width: geometry.size.width * CGFloat(currentTime / max(duration, 1)), height: 3)
                }
            }
            .frame(height: 3)
        }
    }
}

struct VideoInfoView: View {
    let video: Video
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Title and Description
            VStack(alignment: .leading, spacing: 12) {
                Text(video.title)
                    .font(.title2)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.leading)
                
                Text(video.description)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .lineSpacing(4)
                    .multilineTextAlignment(.leading)
            }
            
            // Video Stats
            HStack(spacing: 24) {
                VStack(spacing: 4) {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                        Text(String(format: "%.1f", video.rating))
                            .fontWeight(.semibold)
                    }
                    Text("Rating")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                VStack(spacing: 4) {
                    Text("\(video.views)")
                        .font(.title3)
                        .fontWeight(.semibold)
                    Text("Views")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                VStack(spacing: 4) {
                    Image(systemName: "clock")
                        .foregroundColor(.blue)
                    Text(video.duration)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            // Video Actions
            HStack(spacing: 16) {
                Button(action: {
                    // Add to favorites
                }) {
                    HStack {
                        Image(systemName: "heart")
                        Text("Favorite")
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
                    .background(Color.red.opacity(0.1))
                    .foregroundColor(.red)
                    .cornerRadius(12)
                }
                
                Button(action: {
                    // Share video
                }) {
                    HStack {
                        Image(systemName: "square.and.arrow.up")
                        Text("Share")
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
                    .background(Color.green.opacity(0.1))
                    .foregroundColor(.green)
                    .cornerRadius(12)
                }
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
        )
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }
}

struct RelatedVideosView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Related Videos")
                .font(.title3)
                .fontWeight(.semibold)
                .padding(.horizontal, 16)
            
            Text("More videos you might like will appear here")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .frame(maxWidth: .infinity, alignment: .center)
                .padding(.vertical, 40)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(.systemGray6))
                )
                .padding(.horizontal, 16)
        }
    }
}

#Preview {
    NavigationView {
        VideoPlayerView(video: Video(
            id: "1",
            title: "SwiftUI Tutorial for Beginners",
            description: "Learn the basics of SwiftUI framework in this comprehensive tutorial. We'll cover everything from basic views to complex layouts and animations.",
            category: "Programming",
            videoUrl: "https://example.com/video.mp4",
            thumbnailUrl: "https://example.com/thumbnail.jpg",
            duration: "15:30",
            rating: 4.7,
            views: 2500
        ))
        .environmentObject(VideoViewModel())
    }
}
