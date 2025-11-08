import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io' if (dart.library.html) 'dart:html' as html;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:typed_data';
import '../models/User.dart';
import '../api.dart';

class UsersPage extends StatefulWidget {
  final String registrationCode;
  const UsersPage({super.key, required this.registrationCode});

  @override
  State<UsersPage> createState() => _UsersPageState();
}

class _UsersPageState extends State<UsersPage> {
  bool _isLoading = true;
  String _errorMessage = '';
  List<User> _users = [];
  bool _currentUserIsAdmin = false;
  String? _currentUserEmail;

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  Future<void> _fetchUsers() async {
    setState(() {
      _isLoading = true;
    });
    try {
      final prefs = await SharedPreferences.getInstance();
      _currentUserEmail = prefs.getString('email');

      final response = await http.get(
        apiUri('/api/users?code=${widget.registrationCode}'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> body = jsonDecode(response.body);
        final fetchedUsers = body
            .map((dynamic item) => User.fromJson(item as Map<String, dynamic>))
            .toList();

        final currentUser = fetchedUsers.firstWhere(
          (u) => u.email == _currentUserEmail,
          orElse: () => User(name: '', email: '', isAdmin: false, role: ''),
        );

        setState(() {
          _users = fetchedUsers;
          _currentUserIsAdmin = currentUser.isAdmin;
          _isLoading = false;
        });
      } else {
        throw Exception('Error fetching users.');
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _handleRemoveUser(String emailToRemove) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove User'),
        content: const Text(
          'Are you sure you want to remove this user? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Remove'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      if (_currentUserEmail == null) {
        throw Exception("Requesting user not found. Please log in again.");
      }

      final uri = apiUri('/api/locks/locks/${widget.registrationCode}/invitee/$emailToRemove?requester=$_currentUserEmail');

      final response = await http.delete(uri);

      if (response.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('User successfully removed!'),
              backgroundColor: Colors.green,
            ),
          );
        }
        _fetchUsers();
      } else {
        String errorMessage = 'Error removing user.';
        try {
          errorMessage = jsonDecode(response.body)['error'] ?? errorMessage;
        } catch (_) {}
        throw Exception(errorMessage);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', '')),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _updateUserRole(String targetEmail, String newRole) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final requesterEmail = prefs.getString('email');
      if (requesterEmail == null) throw Exception('Requester not found.');

      final resp = await http.post(
        apiUri('/api/users/update-role'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': targetEmail,
          'code': widget.registrationCode,
          'newRole': newRole,
          'requesterEmail': requesterEmail,
        }),
      );

      if (resp.statusCode >= 200 && resp.statusCode < 300) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Role updated successfully!'),
              backgroundColor: Colors.green,
            ),
          );
        }
        _fetchUsers();
      } else {
        final body = jsonDecode(resp.body);
        throw Exception(body['error'] ?? 'Error updating role.');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', '')),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showEditUserDialog(User user) {
    showDialog(
      context: context,
      builder: (context) =>
          _EditUserDialog(user: user, onUserUpdated: _fetchUsers),
    );
  }

  Widget _buildUserCard(User user) {
    return Card(
      color: Colors.white.withOpacity(0.08),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.white.withOpacity(0.1)),
      ),
      margin: const EdgeInsets.symmetric(vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            CircleAvatar(
              radius: 28,
              backgroundColor: Colors.white.withOpacity(0.2),
              backgroundImage: user.profileImage != null
                  ? NetworkImage('/api/uploads/${user.profileImage}')
                  : null,
              child: user.profileImage == null
                  ? const Icon(Icons.person, color: Colors.white70, size: 30)
                  : null,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Username: ${user.name}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Email: ${user.email}',
                    style: const TextStyle(color: Colors.white70),
                  ),
                  const SizedBox(height: 4),
                Text(
                  'Role: ${user.role.isNotEmpty ? user.role : (user.isAdmin ? "admin" : "guest")}',
                  style: const TextStyle(color: Colors.white70),
                ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                    if (_currentUserIsAdmin && user.email != _currentUserEmail) ...[
                      SizedBox(
                        height: 40,
                        child: DropdownButtonFormField<String>(
                          value: user.role.isNotEmpty
                              ? user.role
                              : (user.isAdmin ? 'admin' : 'guest'),
                          items: const [
                            DropdownMenuItem(
                              value: 'admin',
                              child: Text('Admin'),
                            ),
                            DropdownMenuItem(
                              value: 'user',
                              child: Text('User'),
                            ),
                            DropdownMenuItem(
                              value: 'guest',
                              child: Text('Guest'),
                            ),
                          ],
                          onChanged: (newRole) {
                            if (newRole != null) {
                              _updateUserRole(user.email, newRole);
                            }
                          },
                          decoration: const InputDecoration(
                            isDense: true,
                            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            filled: true,
                            fillColor: Colors.white,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.all(Radius.circular(8)),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          dropdownColor: Colors.white,
                          iconEnabledColor: Colors.black,
                          style: const TextStyle(color: Colors.black),
                        ),
                      ),
                      const SizedBox(width: 10),
                    ],
                    if (_currentUserIsAdmin && !user.isAdmin)
                        ElevatedButton(
                          onPressed: () => _handleRemoveUser(user.email),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red.shade800,
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Remove'),
                        ),
                      if (user.email == _currentUserEmail) ...[
                        if (_currentUserIsAdmin && !user.isAdmin)
                          const SizedBox(width: 10),
                        ElevatedButton(
                          onPressed: () => _showEditUserDialog(user),
                          child: const Text('Edit'),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading)
      return const Center(
        child: CircularProgressIndicator(color: Colors.white),
      );
    if (_errorMessage.isNotEmpty)
      return Center(
        child: Text(
          _errorMessage,
          style: const TextStyle(color: Colors.red, fontSize: 16),
        ),
      );
    if (_users.isEmpty)
      return const Center(
        child: Text(
          'No registered users.',
          style: TextStyle(color: Colors.white, fontSize: 18),
        ),
      );

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            itemCount: _users.length,
            itemBuilder: (context, index) => _buildUserCard(_users[index]),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(24.0),
          child: OutlinedButton(
            onPressed: () => context.go('/lock/${widget.registrationCode}'),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 50),
              side: BorderSide(color: Colors.white.withOpacity(0.5)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('Back'),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF0D1B2A), Color(0xFF000814)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: const Text(
            'Registered Users',
            style: TextStyle(color: Colors.white),
          ),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => context.go('/lock/${widget.registrationCode}'),
          ),
        ),
        body: _buildBody(),
      ),
    );
  }
}

class _EditUserDialog extends StatefulWidget {
  final User user;
  final VoidCallback onUserUpdated;
  const _EditUserDialog({required this.user, required this.onUserUpdated});

  @override
  State<_EditUserDialog> createState() => _EditUserDialogState();
}

class _EditUserDialogState extends State<_EditUserDialog> {
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _passwordController;

  XFile? _selectedImageFile;
  Uint8List? _selectedImageBytes;

  String _error = '';
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.user.name);
    _emailController = TextEditingController(text: widget.user.email);
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final pickedFile = await ImagePicker().pickImage(
      source: ImageSource.gallery,
    );
    if (pickedFile != null) {
      final bytes = await pickedFile.readAsBytes();
      setState(() {
        _selectedImageFile = pickedFile;
        _selectedImageBytes = bytes;
      });
    }
  }

  Future<void> _handleSave() async {
    if (_nameController.text.trim().isEmpty ||
        _emailController.text.trim().isEmpty) {
      setState(() {
        _error = 'Name and email cannot be empty.';
      });
      return;
    }
    if (_passwordController.text.isNotEmpty &&
        _passwordController.text.length < 6) {
      setState(() {
        _error = 'The new password must be at least 6 characters long.';
      });
      return;
    }

    setState(() {
      _isSaving = true;
      _error = '';
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final currentUserEmail = prefs.getString('email');

      var request = http.MultipartRequest(
        'PUT',
        apiUri('/api/users/${widget.user.email}'),
      );
      request.fields['name'] = _nameController.text;
      request.fields['email'] = _emailController.text;
      request.fields['password'] = _passwordController.text;
      request.fields['currentUser'] = currentUserEmail!;

      if (_selectedImageFile != null && _selectedImageBytes != null) {
        if (kIsWeb) {
          // WEB
          request.files.add(
            http.MultipartFile.fromBytes(
              'profileImage',
              _selectedImageBytes!,
              filename: _selectedImageFile!.name,
            ),
          );
        } else {
          // MOBILE
          request.files.add(
            await http.MultipartFile.fromPath(
              'profileImage',
              _selectedImageFile!.path,
            ),
          );
        }
      }

      final response = await request.send();

      if (response.statusCode == 200) {
        if (widget.user.email == currentUserEmail) {
          await prefs.setString('user', _nameController.text);
          await prefs.setString('email', _emailController.text);
        }
        widget.onUserUpdated();
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('User updated successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        final responseBody = await response.stream.bytesToString();
        throw Exception(
          jsonDecode(responseBody)['error'] ?? 'Error updating user.',
        );
      }
    } catch (e) {
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }

  ImageProvider? _getImageProvider() {
    if (_selectedImageBytes != null) {
      return MemoryImage(_selectedImageBytes!);
    }
    if (widget.user.profileImage != null) {
      return NetworkImage(apiUrl('/api/uploads/${widget.user.profileImage}'));
      //return NetworkImage('/api/users/uploads/${widget.user.profileImage}');
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final imageProvider = _getImageProvider();

    return AlertDialog(
      backgroundColor: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: const Text('Edit User', style: TextStyle(color: Colors.white)),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            InkWell(
              onTap: _pickImage,
              child: CircleAvatar(
                radius: 40,
                backgroundColor: Colors.white.withOpacity(0.2),
                backgroundImage: imageProvider,
                child: imageProvider == null
                    ? const Icon(Icons.camera_alt, color: Colors.white70)
                    : null,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Tap to change image',
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _nameController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Nome',
                labelStyle: TextStyle(color: Colors.white70),
              ),
            ),
            TextField(
              controller: _emailController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Email',
                labelStyle: TextStyle(color: Colors.white70),
              ),
            ),
            TextField(
              controller: _passwordController,
              obscureText: true,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'New Password (optional)',
                labelStyle: TextStyle(color: Colors.white70),
              ),
            ),
            if (_error.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 16.0),
                child: Text(_error, style: const TextStyle(color: Colors.red)),
              ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isSaving ? null : _handleSave,
          child: _isSaving
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Save'),
        ),
      ],
    );
  }
}
