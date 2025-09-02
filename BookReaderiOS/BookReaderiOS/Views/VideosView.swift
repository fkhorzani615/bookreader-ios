import SwiftUI

struct VideosView: View {
    @EnvironmentObject var videoViewModel: VideoViewModel
    @EnvironmentObject var categoryViewModel: CategoryViewModel
    @State private var searchText = ""
    @State private var selectedCategory: String = "All"
    @State private var sortOption: SortOption = .title
    @State private var showFilters = false
    
    enum SortOption: String, CaseIterable {
        case title = "Title"
        case rating = "Rating"
        case views = "Views"
        case duration = "Duration"
        case date = "Date"
        
        var icon: String {
            switch self {
            case .title: return "textformat"
            case .rating: return "star"
            case .views: return "eye"
            case .duration: return "clock"
            case .date: return "calendar"
            }
        }
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search and Filter Bar
                VStack(spacing: 12) {
                    SearchBar(text: $searchText)
                    
                    HStack {
                        // Category Filter
                        Menu {
                            Button("All") {
                                selectedCategory = "All"
                            }
                            
                            ForEach(categoryViewModel.categories) { category in
                                Button(category.name) {
                                    selectedCategory = category.name
                                }
                            }
                        } label: {
                            HStack {
                                Image(systemName: "folder")
                                    .font(.caption)
                                Text(selectedCategory)
                                    .font(.subheadline)
                                Image(systemName: "chevron.down")
                                    .font(.caption)
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                        }
                        
                        Spacer()
                        
                        // Sort Button
                        Menu {
                            ForEach(SortOption.allCases, id: \.self) { option in
                                Button {
                                    sortOption = option
                                } label: {
                                    HStack {
                                        Text(option.rawValue)
                                        if sortOption == option {
                                            Image(systemName: "checkmark")
                                        }
                                    }
                                }
                            }
                        } label: {
                            HStack {
                                Image(systemName: sortOption.icon)
                                    .font(.caption)
                                Text("Sort")
                                    .font(.subheadline)
                                Image(systemName: "chevron.down")
                                    .font(.caption)
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .background(Color(.systemBackground))
                
                // Videos Grid
                if videoViewModel.isLoading {
                    Spacer()
                    ProgressView("Loading videos...")
                        .progressViewStyle(CircularProgressViewStyle())
                    Spacer()
                } else if filteredAndSortedVideos.isEmpty {
                    Spacer()
                    VStack(spacing: 16) {
                        Image(systemName: "play.rectangle")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        
                        Text("No videos found")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("Try adjusting your search or filters")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                } else {
                    ScrollView {
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 16), count: 2), spacing: 16) {
                            ForEach(filteredAndSortedVideos) { video in
                                NavigationLink(destination: VideoPlayerView(video: video)) {
                                    VideoCard(video: video)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                    }
                }
            }
            .navigationTitle("Videos")
            .navigationBarTitleDisplayMode(.large)
            .refreshable {
                await videoViewModel.fetchVideos()
            }
        }
        .onChange(of: searchText) { query in
            Task {
                if query.isEmpty {
                    await videoViewModel.fetchVideos()
                } else {
                    await videoViewModel.searchVideos(query: query)
                }
            }
        }
        .onChange(of: selectedCategory) { category in
            Task {
                if category == "All" {
                    await videoViewModel.fetchVideos()
                } else {
                    await videoViewModel.fetchVideosByCategory(category)
                }
            }
        }
    }
    
    private var filteredAndSortedVideos: [Video] {
        var videos = videoViewModel.videos
        
        // Apply category filter
        if selectedCategory != "All" {
            videos = videos.filter { $0.category == selectedCategory }
        }
        
        // Apply search filter
        if !searchText.isEmpty {
            let query = searchText.lowercased()
            videos = videos.filter { video in
                video.title.lowercased().contains(query) ||
                video.description.lowercased().contains(query) ||
                video.tags.contains { $0.lowercased().contains(query) }
            }
        }
        
        // Apply sorting
        switch sortOption {
        case .title:
            videos.sort { $0.title.lowercased() < $1.title.lowercased() }
        case .rating:
            videos.sort { $0.rating > $1.rating }
        case .views:
            videos.sort { $0.views > $1.views }
        case .duration:
            videos.sort { parseDuration($0.duration) < parseDuration($1.duration) }
        case .date:
            videos.sort { $0.createdAt > $1.createdAt }
        }
        
        return videos
    }
    
    private func parseDuration(_ duration: String) -> Int {
        let components = duration.split(separator: ":")
        if components.count == 2 {
            let minutes = Int(components[0]) ?? 0
            let seconds = Int(components[1]) ?? 0
            return minutes * 60 + seconds
        } else if components.count == 3 {
            let hours = Int(components[0]) ?? 0
            let minutes = Int(components[1]) ?? 0
            let seconds = Int(components[2]) ?? 0
            return hours * 3600 + minutes * 60 + seconds
        }
        return 0
    }
}

#Preview {
    VideosView()
        .environmentObject(VideoViewModel())
        .environmentObject(CategoryViewModel())
}
