import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class RegisterLockPage extends StatefulWidget {
  const RegisterLockPage({super.key});

  @override
  State<RegisterLockPage> createState() => _RegisterLockPageState();
}

class _RegisterLockPageState extends State<RegisterLockPage> {
  final _lockNameController = TextEditingController();
  final _registrationCodeController = TextEditingController();
  bool _isLoading = false;
  String _errorMessage = '';

  @override
  void dispose() {
    _lockNameController.dispose();
    _registrationCodeController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    final lockName = _lockNameController.text;
    final registrationCode = _registrationCodeController.text;

    if (lockName.isEmpty || registrationCode.isEmpty) {
      setState(() {
        _errorMessage = 'All fields are required.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final email = prefs.getString('email');

      if (email == null) {
        throw Exception('User not authenticated. Please log in again.');
      }

      final response1 = await http.post(
        Uri.parse('http://localhost:3003/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'code': registrationCode,
          'nickname': lockName,
          'admin': email,
        }),
      );

      final body1 = jsonDecode(response1.body);

      if (response1.statusCode != 200) {
        throw Exception(body1['error'] ?? 'Unknown error while registering lock.');
      }

      try {
        final response2 = await http.post(
          Uri.parse('http://localhost:3001/users/register'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'email': email,
            'code': registrationCode,
          }),
        );
        if (response2.statusCode != 200) {
           final body2 = jsonDecode(response2.body);
           throw Exception(body2['error'] ?? 'Error associating user with lock.');
        }
      } catch (e) {
         throw Exception(e.toString().replaceFirst('Exception: ', ''));
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(body1['message'] ?? 'Lock registered successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        context.go('/home');
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final ButtonStyle primaryButtonStyle = ElevatedButton.styleFrom(
      backgroundColor: const Color(0xFF00040D),
      foregroundColor: Colors.white,
      minimumSize: const Size(double.infinity, 50),
      textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );

    final InputDecoration inputDecoration = InputDecoration(
      hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
      filled: true,
      fillColor: Colors.white.withOpacity(0.05),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.5)),
      ),
    );

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
          title: const Text('Register', style: TextStyle(color: Colors.white)),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => context.go('/home'),
          ),
        ),
        body: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Container(
              padding: const EdgeInsets.all(28.0),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  const Text(
                    'Register New Lock',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 30),
                  TextField(
                    controller: _lockNameController,
                    style: const TextStyle(color: Colors.white),
                    decoration: inputDecoration.copyWith(hintText: 'Lock name'),
                  ),
                  const SizedBox(height: 15),
                  TextField(
                    controller: _registrationCodeController,
                    style: const TextStyle(color: Colors.white),
                    decoration: inputDecoration.copyWith(hintText: 'Lock registration code'),
                  ),
                   if (_errorMessage.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 16.0),
                      child: Text(
                        _errorMessage,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.red, fontSize: 14),
                      ),
                    ),
                  const SizedBox(height: 30),
                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleRegister,
                    style: primaryButtonStyle,
                    child: _isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(strokeWidth: 3, color: Colors.white),
                          )
                        : const Text('Register'),
                  ),
                  const SizedBox(height: 15),
                  OutlinedButton(
                    onPressed: () => context.go('/home'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 50),
                      side: BorderSide(color: Colors.white.withOpacity(0.5)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Back'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
