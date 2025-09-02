import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        Group {
            if authViewModel.isAuthenticated {
                MainTabView()
            } else {
                AuthenticationView()
            }
        }
        .animation(.easeInOut, value: authViewModel.isAuthenticated)
    }
}

struct MainTabView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Home")
                }
                .tag(0)
            
            BooksView()
                .tabItem {
                    Image(systemName: "book.fill")
                    Text("Books")
                }
                .tag(1)
            
            VideosView()
                .tabItem {
                    Image(systemName: "play.rectangle.fill")
                    Text("Videos")
                }
                .tag(2)
            
            SearchView()
                .tabItem {
                    Image(systemName: "magnifyingglass")
                    Text("Search")
                }
                .tag(3)
            
            ProfileView()
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Profile")
                }
                .tag(4)
        }
        .accentColor(.blue)
    }
}

struct AuthenticationView: View {
    @State private var isLogin = true
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // App Logo/Title
                VStack(spacing: 16) {
                    Image(systemName: "book.circle.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.blue)
                    
                    Text("BookReader")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    Text("Your digital library companion")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 60)
                
                Spacer()
                
                // Authentication Forms
                if isLogin {
                    LoginView()
                } else {
                    RegisterView()
                }
                
                Spacer()
                
                // Toggle between Login/Register
                Button(action: {
                    withAnimation(.easeInOut) {
                        isLogin.toggle()
                    }
                }) {
                    Text(isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In")
                        .foregroundColor(.blue)
                        .font(.subheadline)
                }
                .padding(.bottom, 30)
            }
            .padding(.horizontal, 20)
            .navigationBarHidden(true)
        }
    }
}

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var email = ""
    @State private var password = ""
    @State private var showPassword = false
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Welcome Back")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            VStack(spacing: 16) {
                // Email Field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Email")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    TextField("Enter your email", text: $email)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                }
                
                // Password Field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Password")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    HStack {
                        if showPassword {
                            TextField("Enter your password", text: $password)
                        } else {
                            SecureField("Enter your password", text: $password)
                        }
                        
                        Button(action: {
                            showPassword.toggle()
                        }) {
                            Image(systemName: showPassword ? "eye.slash" : "eye")
                                .foregroundColor(.secondary)
                        }
                    }
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                }
            }
            
            // Sign In Button
            Button(action: {
                Task {
                    try await authViewModel.signIn(email: email, password: password)
                }
            }) {
                HStack {
                    if authViewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(0.8)
                    } else {
                        Text("Sign In")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            .disabled(authViewModel.isLoading || email.isEmpty || password.isEmpty)
            .opacity((email.isEmpty || password.isEmpty) ? 0.6 : 1.0)
            
            // Forgot Password
            Button("Forgot Password?") {
                // Handle forgot password
            }
            .font(.subheadline)
            .foregroundColor(.blue)
            
            if let errorMessage = authViewModel.errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(.horizontal, 20)
    }
}

struct RegisterView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var displayName = ""
    @State private var showPassword = false
    @State private var showConfirmPassword = false
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Create Account")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            VStack(spacing: 16) {
                // Display Name Field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Full Name")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    TextField("Enter your full name", text: $displayName)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                }
                
                // Email Field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Email")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    TextField("Enter your email", text: $email)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                }
                
                // Password Field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Password")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    HStack {
                        if showPassword {
                            TextField("Enter your password", text: $password)
                        } else {
                            SecureField("Enter your password", text: $password)
                        }
                        
                        Button(action: {
                            showPassword.toggle()
                        }) {
                            Image(systemName: showPassword ? "eye.slash" : "eye")
                                .foregroundColor(.secondary)
                        }
                    }
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                }
                
                // Confirm Password Field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Confirm Password")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    HStack {
                        if showConfirmPassword {
                            TextField("Confirm your password", text: $confirmPassword)
                        } else {
                            SecureField("Confirm your password", text: $confirmPassword)
                        }
                        
                        Button(action: {
                            showConfirmPassword.toggle()
                        }) {
                            Image(systemName: showConfirmPassword ? "eye.slash" : "eye")
                                .foregroundColor(.secondary)
                        }
                    }
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                }
            }
            
            // Sign Up Button
            Button(action: {
                Task {
                    try await authViewModel.signUp(
                        email: email,
                        password: password,
                        displayName: displayName
                    )
                }
            }) {
                HStack {
                    if authViewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(0.8)
                    } else {
                        Text("Create Account")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            .disabled(authViewModel.isLoading || !isFormValid)
            .opacity(isFormValid ? 1.0 : 0.6)
            
            if let errorMessage = authViewModel.errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(.horizontal, 20)
    }
    
    private var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty && !confirmPassword.isEmpty && 
        !displayName.isEmpty && password == confirmPassword && password.count >= 6
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthViewModel())
        .environmentObject(BookViewModel())
        .environmentObject(VideoViewModel())
        .environmentObject(CategoryViewModel())
}
