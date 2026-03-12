const login = async (email: string, password: string) => {
    const response = await fetch("https://resumewala.co.in/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });
    return response.json();
};

const register = async (email: string, fullName: string, mobileNumber: string, password: string) => {
    const response = await fetch("https://resumewala.co.in/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, fullName, mobileNumber, password }),
    });
    return response.json();
};

export default { login, register };