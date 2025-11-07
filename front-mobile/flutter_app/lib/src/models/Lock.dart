import 'dart:convert';

List<Lock> lockFromJson(String str) =>
    List<Lock>.from(json.decode(str).map((x) => Lock.fromJson(x)));

class Lock {
  final String lockName;
  final bool isAdmin;
  final String registrationCode;
  final String? role;

  Lock({
    required this.lockName,
    required this.isAdmin,
    required this.registrationCode,
    this.role,
  });

  factory Lock.fromJson(Map<String, dynamic> json) => Lock(
        lockName: json["lockName"],
        isAdmin: json["isAdmin"],
        registrationCode: json["registrationCode"],
        role: json["role"] as String?,
      );

  Lock copyWith({String? role}) => Lock(
        lockName: lockName,
        isAdmin: isAdmin,
        registrationCode: registrationCode,
        role: role ?? this.role,
      );
}