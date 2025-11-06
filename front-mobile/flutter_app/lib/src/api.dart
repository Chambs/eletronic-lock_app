const String kApiBase =
    String.fromEnvironment('API_BASE', defaultValue: '');

Uri apiUri(String path) {
  if (kApiBase.isEmpty) return Uri.parse(path);
  final base = kApiBase.endsWith('/') ? kApiBase.substring(0, kApiBase.length - 1) : kApiBase;
  return Uri.parse('$base$path');
}

String apiUrl(String path) {
  if (kApiBase.isEmpty) return path;
  final base = kApiBase.endsWith('/') ? kApiBase.substring(0, kApiBase.length - 1) : kApiBase;
  return '$base$path';
}


