class User {
  final String name;
  final String email;
  final bool isAdmin;
  final String? profileImage;
  
  User({
    required this.name,
    required this.email,
    required this.isAdmin,
    this.profileImage,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      name: json['name'] ?? 'Unknown name',
      email: json['email'] ?? 'Unknown email',
      isAdmin: json['isAdmin'] ?? false,
      profileImage: json['profileImage'],
    );
  }
}
