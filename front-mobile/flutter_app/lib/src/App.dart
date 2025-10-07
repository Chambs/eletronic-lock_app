import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'pages/InitialPage.dart';
import 'pages/SignInPage.dart';
import 'pages/SignUpPage.dart';
import 'pages/HomePage.dart';
import 'pages/RegisterLockPage.dart';
import 'pages/JoinLockPage.dart';
import 'pages/LockPage.dart';
import 'pages/LogsPage.dart';
import 'pages/UsersPage.dart';

final GoRouter _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (BuildContext context, GoRouterState state) {
        return const InitialPage();
      },
    ),
    GoRoute(
      path: '/signin',
      builder: (BuildContext context, GoRouterState state) {
        return const SignInPage();
      },
    ),
    GoRoute(
      path: '/signup',
      builder: (BuildContext context, GoRouterState state) {
        return const SignUpPage();
      },
    ),
    GoRoute(
      path: '/home',
      builder: (BuildContext context, GoRouterState state) {
        return const HomePage();
      },
    ),
    GoRoute(
      path: '/register-lock',
      builder: (BuildContext context, GoRouterState state) {
        return const RegisterLockPage();
      },
    ),
    GoRoute(
      path: '/join-lock',
      builder: (BuildContext context, GoRouterState state) {
        return const JoinLockPage();
      },
    ),
    GoRoute(
      path: '/lock/:registrationCode',
      builder: (BuildContext context, GoRouterState state) {
        final registrationCode = state.pathParameters['registrationCode']!;
        return LockPage(registrationCode: registrationCode);
      },
    ),
    GoRoute(
      path: '/logs/:registrationCode',
      builder: (BuildContext context, GoRouterState state) {
        final registrationCode = state.pathParameters['registrationCode']!;
        return LogsPage(registrationCode: registrationCode);
      },
    ),
    GoRoute(
      path: '/users/:registrationCode',
      builder: (BuildContext context, GoRouterState state) {
        final registrationCode = state.pathParameters['registrationCode']!;
        return UsersPage(registrationCode: registrationCode);
      },
    ),
  ],
);

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Electronic Lock App',
      routerConfig: _router,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}
