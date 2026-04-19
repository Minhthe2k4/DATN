import { Navigate, useLocation } from 'react-router-dom';
import { getUserSession } from './authSession';

/**
 * ProtectedRoute component wraps routes that require a logged-in user.
 * If the user is not authenticated, it redirects them to the /login page,
 * saving the current location so they can be redirected back after login.
 */
export const ProtectedRoute = ({ children }) => {
    const session = getUserSession();
    const location = useLocation();

    if (!session) {
        // Redirect to login but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};
