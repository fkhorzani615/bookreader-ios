import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showingEditProfile = false
    @State private var showingSettings = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile Header
                    ProfileHeaderView()
                    
                    // Quick Stats
                    QuickStatsView()
                    
                    // Profile Actions
                    ProfileActionsView()
                    
                    // Settings Section
                    SettingsSectionView()
                    
                    // Firebase Test Button
                    FirebaseTestButton()
                    
                    // Sign Out Button
                    SignOutButton()
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.large)
            .refreshable {
                // Refresh user data
            }
        }
        .sheet(isPresented: $showingEditProfile) {
            EditProfileView()
        }
        .sheet(isPresented: $showingSettings) {
            SettingsView()
        }
    }
}

struct ProfileHeaderView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        VStack(spacing: 16) {
            // Profile Picture
            Circle()
                .fill(Color.blue.opacity(0.2))
                .frame(width: 100, height: 100)
                .overlay(
                    Image(systemName: "person.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.blue)
                )
            
            // User Info
            VStack(spacing: 8) {
                Text(authViewModel.currentUser?.displayName ?? "User")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Text(authViewModel.currentUser?.email ?? "")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                // Subscription Status
                HStack {
                    Image(systemName: "crown.fill")
                        .foregroundColor(.yellow)
                        .font(.caption)
                    
                    Text(authViewModel.currentUser?.subscription.plan.capitalized ?? "Free")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color(.systemGray6))
                .cornerRadius(12)
            }
        }
        .padding(.vertical, 24)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
        )
        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

struct QuickStatsView: View {
    var body: some View {
        HStack(spacing: 16) {
            StatCard(
                icon: "book.closed",
                title: "Books Read",
                value: "12",
                color: .blue
            )
            
            StatCard(
                icon: "play.rectangle",
                title: "Videos Watched",
                value: "28",
                color: .green
            )
            
            StatCard(
                icon: "star.fill",
                title: "Favorites",
                value: "8",
                color: .orange
            )
        }
    }
}

struct StatCard: View {
    let icon: String
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(color)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemBackground))
        )
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct ProfileActionsView: View {
    @State private var showingEditProfile = false
    
    var body: some View {
        VStack(spacing: 12) {
            ProfileActionButton(
                icon: "pencil",
                title: "Edit Profile",
                subtitle: "Update your personal information",
                action: { showingEditProfile = true }
            )
            
            ProfileActionButton(
                icon: "gear",
                title: "Settings",
                subtitle: "App preferences and notifications",
                action: { /* Show settings */ }
            )
            
            ProfileActionButton(
                icon: "crown",
                title: "Subscription",
                subtitle: "Manage your subscription plan",
                action: { /* Show subscription */ }
            )
            
            ProfileActionButton(
                icon: "questionmark.circle",
                title: "Help & Support",
                subtitle: "Get help and contact support",
                action: { /* Show help */ }
            )
        }
    }
}

struct ProfileActionButton: View {
    let icon: String
    let title: String
    let subtitle: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(.blue)
                    .frame(width: 24)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.systemBackground))
            )
            .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct SettingsSectionView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Settings")
                .font(.title3)
                .fontWeight(.semibold)
            
            VStack(spacing: 12) {
                SettingsRow(
                    icon: "bell",
                    title: "Notifications",
                    hasToggle: true
                )
                
                SettingsRow(
                    icon: "globe",
                    title: "Language",
                    subtitle: "English",
                    hasChevron: true
                )
                
                SettingsRow(
                    icon: "moon",
                    title: "Dark Mode",
                    hasToggle: true
                )
                
                SettingsRow(
                    icon: "wifi",
                    title: "Data Usage",
                    subtitle: "Wi-Fi only",
                    hasChevron: true
                )
            }
        }
    }
}

struct SettingsRow: View {
    let icon: String
    let title: String
    var subtitle: String? = nil
    var hasToggle: Bool = false
    var hasChevron: Bool = false
    @State private var isToggled = false
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(.blue)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.primary)
                
                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            if hasToggle {
                Toggle("", isOn: $isToggled)
                    .labelsHidden()
            } else if hasChevron {
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemBackground))
        )
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct SignOutButton: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        Button(action: {
            try? authViewModel.signOut()
        }) {
            HStack {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 18))
                
                Text("Sign Out")
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            .foregroundColor(.red)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.red, lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct EditProfileView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var displayName = ""
    @State private var bio = ""
    @State private var location = ""
    @State private var phone = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section("Personal Information") {
                    TextField("Display Name", text: $displayName)
                    TextField("Bio", text: $bio, axis: .vertical)
                        .lineLimit(3...6)
                    TextField("Location", text: $location)
                    TextField("Phone", text: $phone)
                        .keyboardType(.phonePad)
                }
                
                Section("Account") {
                    HStack {
                        Text("Email")
                        Spacer()
                        Text(authViewModel.currentUser?.email ?? "")
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("Member Since")
                        Spacer()
                        Text(authViewModel.currentUser?.createdAt.formatted(date: .abbreviated, time: .omitted) ?? "")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        Task {
                            try await authViewModel.updateUserProfile([
                                "displayName": displayName,
                                "bio": bio,
                                "location": location,
                                "phone": phone
                            ])
                            dismiss()
                        }
                    }
                    .disabled(displayName.isEmpty)
                }
            }
        }
        .onAppear {
            displayName = authViewModel.currentUser?.displayName ?? ""
            bio = authViewModel.currentUser?.bio ?? ""
            location = authViewModel.currentUser?.location ?? ""
            phone = authViewModel.currentUser?.phone ?? ""
        }
    }
}

struct SettingsView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            Form {
                Section("App Settings") {
                    HStack {
                        Text("Notifications")
                        Spacer()
                        Toggle("", isOn: .constant(true))
                            .labelsHidden()
                    }
                    
                    HStack {
                        Text("Dark Mode")
                        Spacer()
                        Toggle("", isOn: .constant(false))
                            .labelsHidden()
                    }
                    
                    HStack {
                        Text("Language")
                        Spacer()
                        Text("English")
                            .foregroundColor(.secondary)
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Section("Data & Privacy") {
                    HStack {
                        Text("Data Usage")
                        Spacer()
                        Text("Wi-Fi only")
                            .foregroundColor(.secondary)
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("Privacy Policy")
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("Terms of Service")
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct FirebaseTestButton: View {
    @State private var showingFirebaseTest = false
    
    var body: some View {
        Button(action: {
            showingFirebaseTest = true
        }) {
            HStack {
                Image(systemName: "flame.fill")
                    .foregroundColor(.orange)
                Text("Test Firebase Connection")
                    .fontWeight(.medium)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
        .sheet(isPresented: $showingFirebaseTest) {
            FirebaseTestView()
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
}
