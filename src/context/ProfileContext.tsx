import { createContext, useContext, useState } from "react";


interface ProfileContextType {
    profile: any;
    setProfile: (profile: any) => void;
}
const ProfileContext = createContext<ProfileContextType | null>(null);


export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
    const [profile, setProfile] = useState<any>(null);

    return (
        <ProfileContext.Provider value={{ profile, setProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used inside ProfileProvider");
    }
    return context;
};