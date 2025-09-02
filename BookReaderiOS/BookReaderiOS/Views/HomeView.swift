import SwiftUI

struct HomeView: View {
    @EnvironmentObject var bookViewModel: BookViewModel
    @EnvironmentObject var videoViewModel: VideoViewModel
    @EnvironmentObject var categoryViewModel: CategoryViewModel
    @State private var searchText = ""
    @State private var selectedCategory: Category?
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Hero Section
                    HeroSection()
                    
                    // Search Bar
                    SearchBar(text: $searchText)
                    
                    // Categories
                    CategoriesSection(
                        categories: categoryViewModel.categories,
                        selectedCategory: $selectedCategory
                    )
                    
                    // Featured Books
                    if !bookViewModel.featuredBooks.isEmpty {
                        FeaturedBooksSection(books: bookViewModel.featuredBooks)
                    }
                    
                    // Featured Videos
                    if !videoViewModel.featuredVideos.isEmpty {
                        FeaturedVideosSection(videos: videoViewModel.featuredVideos)
                    }
                    
                    // Recent Content
                    RecentContentSection()
                }
                .padding(.horizontal, 16)
            }
            .navigationTitle("BookReader")
            .navigationBarTitleDisplayMode(.large)
            .refreshable {
                await refreshContent()
            }
        }
        .onChange(of: selectedCategory) { category in
            if let category = category {
                Task {
                    await bookViewModel.fetchBooksByCategory(category.name)
                    await videoViewModel.fetchVideosByCategory(category.name)
                }
            }
        }
        .onChange(of: searchText) { query in
            Task {
                if query.isEmpty {
                    await bookViewModel.fetchBooks()
                    await videoViewModel.fetchVideos()
                } else {
                    await bookViewModel.searchBooks(query: query)
                    await videoViewModel.searchVideos(query: query)
                }
            }
        }
    }
    
    private func refreshContent() async {
        await bookViewModel.fetchBooks()
        await videoViewModel.fetchVideos()
        await categoryViewModel.fetchCategories()
    }
}

struct HeroSection: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "book.circle.fill")
                .font(.system(size: 60))
                .foregroundColor(.blue)
            
            Text("Welcome to BookReader")
                .font(.title)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
            
            Text("Discover thousands of books and videos to expand your knowledge")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.vertical, 32)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.blue.opacity(0.1))
        )
    }
}

struct SearchBar: View {
    @Binding var text: String
    
    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
            
            TextField("Search books, videos, authors...", text: $text)
                .textFieldStyle(PlainTextFieldStyle())
            
            if !text.isEmpty {
                Button(action: {
                    text = ""
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemGray6))
        )
    }
}

struct CategoriesSection: View {
    let categories: [Category]
    @Binding var selectedCategory: Category?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Categories")
                .font(.title2)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 2), spacing: 12) {
                ForEach(categories) { category in
                    CategoryCard(
                        category: category,
                        isSelected: selectedCategory?.id == category.id
                    ) {
                        if selectedCategory?.id == category.id {
                            selectedCategory = nil
                        } else {
                            selectedCategory = category
                        }
                    }
                }
            }
        }
    }
}

struct CategoryCard: View {
    let category: Category
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                Image(systemName: category.icon)
                    .font(.system(size: 32))
                    .foregroundColor(Color(hex: category.color))
                
                Text(category.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
                
                Text(category.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? Color.blue.opacity(0.1) : Color(.systemGray6))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(isSelected ? Color.blue : Color.clear, lineWidth: 2)
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct FeaturedBooksSection: View {
    let books: [Book]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Featured Books")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Spacer()
                
                NavigationLink("See All", destination: BooksView())
                    .font(.subheadline)
                    .foregroundColor(.blue)
            }
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(books) { book in
                        NavigationLink(destination: BookDetailView(book: book)) {
                            BookCard(book: book)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                .padding(.horizontal, 4)
            }
        }
    }
}

struct FeaturedVideosSection: View {
    let videos: [Video]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Featured Videos")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Spacer()
                
                NavigationLink("See All", destination: VideosView())
                    .font(.subheadline)
                    .foregroundColor(.blue)
            }
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(videos) { video in
                        NavigationLink(destination: VideoPlayerView(video: video)) {
                            VideoCard(video: video)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                .padding(.horizontal, 4)
            }
        }
    }
}

struct RecentContentSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Recent Content")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Your recently viewed content will appear here")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .frame(maxWidth: .infinity, alignment: .center)
                .padding(.vertical, 40)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(.systemGray6))
                )
        }
    }
}

// Helper extension for hex colors
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview {
    HomeView()
        .environmentObject(BookViewModel())
        .environmentObject(VideoViewModel())
        .environmentObject(CategoryViewModel())
}
