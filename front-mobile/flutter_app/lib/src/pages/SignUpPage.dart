import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String _errorMessage = '';

  bool _isValidEmail(String email) {
    return RegExp(r"^[^\s@]+@[^\s@]+\.[^\s@]+$").hasMatch(email);
  }

  Future<void> _handleSignUp() async {
    setState(() {
      _errorMessage = '';
    });

    final username = _usernameController.text;
    final email = _emailController.text;
    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (username.trim().isEmpty) {
      setState(() => _errorMessage = 'Name is required.');
      return;
    }
    if (!_isValidEmail(email)) {
      setState(() => _errorMessage = 'Invalid email.');
      return;
    }
    if (password.length < 6) {
      setState(() => _errorMessage = 'The password must be at least 6 characters long.');
      return;
    }
    if (password != confirmPassword) {
      setState(() => _errorMessage = 'The passwords do not match.');
      return;
    }

    try {
      final response = await http.post(
        Uri.parse('http://localhost:3001/users'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': username,
          'email': email,
          'password': password,
        }),
      );

      if (!mounted) return;

      if (response.statusCode >= 200 && response.statusCode < 300) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Registration successful!'),
            backgroundColor: Colors.green,
          ),
        );
        context.go('/signin');
      } else {
        final responseBody = jsonDecode(response.body);
        setState(() {
          _errorMessage = responseBody['error'] ?? 'Server error. Please try again.';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Connection error. Check the server and your internet connection.';
      });
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
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
    final ButtonStyle secondaryButtonStyle = OutlinedButton.styleFrom(
      foregroundColor: Colors.white70,
      minimumSize: const Size(double.infinity, 50),
      side: BorderSide(color: Colors.white.withOpacity(0.2)),
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
          title: const Text('Sign Up', style: TextStyle(color: Colors.white)),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => context.go('/'),
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
                    'Sign Up',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 30),
                  TextField(
                    controller: _usernameController,
                    style: const TextStyle(color: Colors.white),
                    decoration: inputDecoration.copyWith(hintText: 'Username'),
                    keyboardType: TextInputType.name,
                  ),
                  const SizedBox(height: 15),
                  TextField(
                    controller: _emailController,
                    style: const TextStyle(color: Colors.white),
                    decoration: inputDecoration.copyWith(hintText: 'E-mail'),
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 15),
                  TextField(
                    controller: _passwordController,
                    style: const TextStyle(color: Colors.white),
                    obscureText: true,
                    decoration: inputDecoration.copyWith(hintText: 'Password'),
                  ),
                  const SizedBox(height: 15),
                  TextField(
                    controller: _confirmPasswordController,
                    style: const TextStyle(color: Colors.white),
                    obscureText: true,
                    decoration: inputDecoration.copyWith(hintText: 'Confirm Password'),
                  ),
                  const SizedBox(height: 20),
                  if (_errorMessage.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10.0),
                      child: Text(
                        _errorMessage,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.red, fontSize: 14),
                      ),
                    ),
                  ElevatedButton(
                    onPressed: _handleSignUp,
                    style: primaryButtonStyle,
                    child: const Text('Create User'),
                  ),
                  const SizedBox(height: 15),
                  OutlinedButton(
                    onPressed: () => context.go('/'),
                    style: secondaryButtonStyle,
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
