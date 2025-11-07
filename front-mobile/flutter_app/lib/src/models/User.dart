class User {
  final String name;
  final String email;
  final bool isAdmin;
  final String role;
  final String? profileImage;
  
  User({
    required this.name,
    required this.email,
    required this.isAdmin,
    required this.role,
    this.profileImage,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    final String roleFromApi = (json['role'] as String?) ??
      ((json['isAdmin'] == true) ? 'admin' : 'guest');
    final bool isAdminCompat = (json['isAdmin'] as bool?) ?? (roleFromApi == 'admin');
    return User(
      name: json['name'] ?? 'Unknown name',
      email: json['email'] ?? 'Unknown email',
      isAdmin: isAdminCompat,
      role: roleFromApi,
      profileImage: json['profileImage'],
    );
  }
}
