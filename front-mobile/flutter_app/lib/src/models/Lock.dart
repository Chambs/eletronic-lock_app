import 'dart:convert';

List<Lock> lockFromJson(String str) =>
    List<Lock>.from(json.decode(str).map((x) => Lock.fromJson(x)));

class Lock {
  final String lockName;
  final bool isAdmin;
  final String registrationCode;

  Lock({
    required this.lockName,
    required this.isAdmin,
    required this.registrationCode,
  });

  factory Lock.fromJson(Map<String, dynamic> json) => Lock(
        lockName: json["lockName"],
        isAdmin: json["isAdmin"],
        registrationCode: json["registrationCode"],
      );
}