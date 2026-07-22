import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Page Imports
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Family from "./pages/Family";
import Documents from "./pages/Documents";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <NavigationContainer
          documentTitle={{
            formatter: (options, route) => `${options?.title ?? route?.name} - Smart Docs`,
          }}
        >
          <AuthProvider>
            <Stack.Navigator 
              initialRouteName="Index"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Index" component={Index} />
              <Stack.Screen name="Auth" component={Auth} />
              
              {/* Protected Routes */}
              <Stack.Screen name="Dashboard">
                {(props: any) => (
                  <ProtectedRoute>
                    <Dashboard {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>
              
              <Stack.Screen name="Family">
                {(props: any) => (
                  <ProtectedRoute>
                    <Family {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>
              
              <Stack.Screen name="Documents">
                {(props: any) => (
                  <ProtectedRoute>
                    <Documents {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>
              
              <Stack.Screen name="Profile">
                {(props: any) => (
                  <ProtectedRoute>
                    <ProfilePage {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>

              <Stack.Screen name="Notifications">
                {(props: any) => (
                  <ProtectedRoute>
                    <NotificationsPage {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>

              <Stack.Screen name="Analytics">
                {(props: any) => (
                  <ProtectedRoute>
                    <Analytics {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>

              <Stack.Screen name="Search">
                {(props: any) => (
                  <ProtectedRoute>
                    <Search {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>

              <Stack.Screen name="Settings">
                {(props: any) => (
                  <ProtectedRoute>
                    <Settings {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>



              {/* Catch-all/NotFound is usually handled by navigation logic in RN, 
                  but we include it here for consistency */}
              <Stack.Screen name="NotFound" component={NotFound} />
            </Stack.Navigator>
          </AuthProvider>
        </NavigationContainer>
      </PaperProvider>
    </QueryClientProvider>
  );
};

export default App;
