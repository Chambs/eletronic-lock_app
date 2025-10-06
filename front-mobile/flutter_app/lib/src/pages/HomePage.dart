import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/Lock.dart';
import '../widgets/LockCard.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String _userName = '';
  List<Lock> _locks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchUserDataAndLocks();
  }

  Future<void> _fetchUserDataAndLocks() async {
    final prefs = await SharedPreferences.getInstance();
    final email = prefs.getString('email');
    setState(() {
      _userName = prefs.getString('user') ?? 'User';
    });

    if (email != null) {
      await _fetchLocks(email);
    } else {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchLocks(String email) async {
    try {
      final response = await http.post(
        Uri.parse('http://localhost:3003/locks'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        final responseBody = jsonDecode(response.body);
        final List<Lock> fetchedLocks = (responseBody['list'] as List)
            .map((lockJson) => Lock.fromJson(lockJson))
            .toList();
        setState(() => _locks = fetchedLocks);
      } else {
        _showErrorSnackbar('Error fetching locks.');
        setState(() => _locks = []);
      }
    } catch (e) {
      _showErrorSnackbar('Connection error. Check the server.');
      setState(() => _locks = []);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleRegisterLock() async {
    if (mounted) context.go('/register-lock');
  }

  Future<void> _handleJoinLock() async {
    if (mounted) context.go('/join-lock');
  }

  Future<void> _handleLogout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (mounted) context.go('/');
  }

  void _showErrorSnackbar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final ButtonStyle primaryButtonStyle = ElevatedButton.styleFrom(
      backgroundColor: const Color(0xFF00040D).withOpacity(0.8),
      foregroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 35),
      textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      side: BorderSide(color: Colors.white.withOpacity(0.2)),
    );

    final ButtonStyle logoutButtonStyle = primaryButtonStyle.copyWith(
      backgroundColor: MaterialStateProperty.all(
        Colors.red.shade900.withOpacity(0.8),
      ),
      minimumSize: MaterialStateProperty.all(const Size(350.0, 30.0)),
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
          title: Center(
            child: Text(
              'Welcome, $_userName',
              style: const TextStyle(color: Colors.white),
            ),
          ),
          automaticallyImplyLeading: false,
        ),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton(
                    onPressed: _handleRegisterLock,
                    style: primaryButtonStyle,
                    child: const Text('Register New Lock'),
                  ),
                  const SizedBox(width: 16),
                  ElevatedButton(
                    onPressed: _handleJoinLock,
                    style: primaryButtonStyle,
                    child: const Text('Join as a Guest'),
                  ),
                ],
              ),
              const Divider(color: Colors.white24, height: 40, thickness: 1),

              Expanded(
                child: _isLoading
                    ? const Center(
                        child: CircularProgressIndicator(color: Colors.white),
                      )
                    : _locks.isEmpty
                    ? const Center(
                        child: Text(
                          'No lock registered yet.',
                          style: TextStyle(color: Colors.white70, fontSize: 16),
                        ),
                      )
                    : ListView.builder(
                        itemCount: _locks.length,
                        itemBuilder: (context, index) {
                          return LockCard(lock: _locks[index]);
                        },
                      ),
              ),

              const Divider(color: Colors.white24, height: 40, thickness: 1),

              Padding(
                padding: const EdgeInsets.only(top: 16.0),
                child: ElevatedButton(
                  onPressed: _handleLogout,
                  style: logoutButtonStyle,
                  child: const Text('Exit'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
