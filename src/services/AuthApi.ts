const login = async (email: string, password: string) => {
    const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });
    return response.json();
};

const register = async (email: string, fullName: string, mobileNumber: string, password: string) => {
    const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, fullName, mobileNumber, password }),
    });
    return response.json();
};

export default { login, register };