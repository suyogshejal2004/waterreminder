import { CommonActions, createNavigationContainerRef, StackActions } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function navigate(routeName: string, params?: object) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(CommonActions.navigate({ name: routeName, params }));
    } else {
        console.warn("Navigation not ready! (navigate)", routeName);
    }
}

export function replace(routeName: string, params?: object) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.replace(routeName, params));
    } else {
        console.warn("Navigation not ready! (replace)", routeName);
    }
}

export function resetAndNavigate(routeName: string) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(CommonActions.reset({
            index: 0,
            routes: [{ name: routeName }],
        }));
    } else {
        console.warn("Navigation not ready! (resetAndNavigate)", routeName);
    }
}

export function goBack() {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(CommonActions.goBack());
    } else {
        console.warn("Navigation not ready! (goBack)");
    }
}

export function push(routeName: string, params?: object) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.push(routeName, params));
    } else {
        console.warn("Navigation not ready! (push)", routeName);
    }
}
