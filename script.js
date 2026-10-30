// ==========================================
// TASK HUB - SUPABASE + WEBSITE JAVASCRIPT
// ==========================================

const SUPABASE_URL =
    "https://bcogfxghqrffrnfetqbo.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_cX6B4WgoF6bwz1Br5kIj4g_p4RsBRJP";


// ==========================================
// SUPABASE REQUEST HELPER
// ==========================================

async function supabaseRequest(path, options = {}) {

    const accessToken =
        localStorage.getItem("taskhub_access_token");

    const headers = {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (!headers["Authorization"] && accessToken) {
        headers["Authorization"] =
            `Bearer ${accessToken}`;
    }

    const response = await fetch(
        `${SUPABASE_URL}${path}`,
        {
            ...options,
            headers
        }
    );

    const text = await response.text();

    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    return {
        ok: response.ok,
        status: response.status,
        data
    };
}


// ==========================================
// HTML ESCAPING
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// MOBILE MENU / FAQ / GENERAL UI
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const menuBtn =
        document.getElementById("menuBtn");

    const mobileMenu =
        document.getElementById("mobileMenu");


    // ------------------------------------------
    // MOBILE MENU
    // ------------------------------------------

    if (menuBtn && mobileMenu) {

        menuBtn.setAttribute(
            "aria-expanded",
            "false"
        );

        menuBtn.addEventListener("click", () => {

            mobileMenu.classList.toggle("active");

            const opened =
                mobileMenu.classList.contains("active");

            menuBtn.setAttribute(
                "aria-expanded",
                opened ? "true" : "false"
            );

        });


        mobileMenu.querySelectorAll("a")
            .forEach(link => {

                link.addEventListener("click", () => {

                    mobileMenu.classList.remove("active");

                    menuBtn.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                });

            });

    }


    // ------------------------------------------
    // FAQ
    // ------------------------------------------

    const faqQuestions =
        document.querySelectorAll(".faq-question");

    faqQuestions.forEach(question => {

        question.addEventListener("click", () => {

            const item =
                question.closest(".faq-item");

            if (!item) return;

            document.querySelectorAll(".faq-item")
                .forEach(other => {

                    if (other !== item) {
                        other.classList.remove("active");
                    }

                });

            item.classList.toggle("active");

        });

    });


    // ------------------------------------------
    // HEADER SCROLL
    // ------------------------------------------

    const header =
        document.querySelector(".header");

    if (header) {

        window.addEventListener("scroll", () => {

            if (window.scrollY > 20) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }

        });

    }


    // ------------------------------------------
    // SMOOTH SCROLL
    // ------------------------------------------

    document.querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener("click", event => {

                const id =
                    link.getAttribute("href");

                if (!id || id === "#") return;

                const target =
                    document.querySelector(id);

                if (!target) return;

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth"
                });

            });

        });


    // ------------------------------------------
    // REGISTER
    // ------------------------------------------

    const registerForm =
        document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            registerUser
        );

        loadReferralCode();

    }


    // ------------------------------------------
    // LOGIN
    // ------------------------------------------

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            loginUser
        );

    }


    // ------------------------------------------
    // CLOSE MOBILE MENU OUTSIDE
    // ------------------------------------------

    document.addEventListener("click", event => {

        if (!mobileMenu || !menuBtn) return;

        const insideMenu =
            mobileMenu.contains(event.target);

        const menuButton =
            menuBtn.contains(event.target);

        if (
            !insideMenu &&
            !menuButton &&
            mobileMenu.classList.contains("active")
        ) {

            mobileMenu.classList.remove("active");

            menuBtn.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

});


// ==========================================
// LOAD REFERRAL CODE FROM URL
// ==========================================

function loadReferralCode() {

    const field =
        document.getElementById("referralCode");

    if (!field) return;

    const params =
        new URLSearchParams(window.location.search);

    const referral =
        (
            params.get("ref") ||
            params.get("referral") ||
            params.get("referral_code") ||
            ""
        )
        .trim()
        .toUpperCase();

    if (referral) {
        field.value = referral;
    }

}


// ==========================================
// REGISTER USER
// ==========================================

async function registerUser(event) {

    event.preventDefault();

    const form = event.target;

    const message =
        document.getElementById("authMessage");

    const name =
        document.getElementById("name")
            .value
            .trim();

    const username =
        document.getElementById("username")
            .value
            .trim()
            .toLowerCase();

    const email =
        document.getElementById("email")
            .value
            .trim()
            .toLowerCase();

    const phone =
        document.getElementById("phone")
            .value
            .trim();

    const password =
        document.getElementById("password")
            .value;

    const confirmPassword =
        document.getElementById("confirmPassword")
            .value;

    const terms =
        document.getElementById("terms");


    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (name.length < 2) {

        showMessage(
            message,
            "Please enter your full name.",
            "error"
        );

        return;
    }


    if (username.length < 3) {

        showMessage(
            message,
            "Username must contain at least 3 characters.",
            "error"
        );

        return;
    }


    if (!/^[a-zA-Z0-9_]+$/.test(username)) {

        showMessage(
            message,
            "Username can only contain letters, numbers and underscores.",
            "error"
        );

        return;
    }


    if (password.length < 8) {

        showMessage(
            message,
            "Password must contain at least 8 characters.",
            "error"
        );

        return;
    }


    if (password !== confirmPassword) {

        showMessage(
            message,
            "Passwords do not match.",
            "error"
        );

        return;
    }


    if (terms && !terms.checked) {

        showMessage(
            message,
            "Please agree to the terms and conditions.",
            "error"
        );

        return;
    }


    // ------------------------------------------
    // BUTTON
    // ------------------------------------------

    const button =
        form.querySelector(
            "button[type='submit']"
        );

    const originalText =
        button ? button.textContent : "";


    if (button) {

        button.disabled = true;

        button.textContent =
            "Creating account...";

    }


    try {

        // --------------------------------------
        // REFERRAL
        // --------------------------------------

        const referralCode =
            (
                document.getElementById("referralCode")
                    ?.value || ""
            )
            .trim()
            .toUpperCase() || null;

// --------------------------------------
// FIND REFERRER USER ID
// --------------------------------------

let referredBy = null;

if (referralCode) {

    const referrer =
        await supabaseRequest(
            "/rest/v1/rpc/get_referrer_by_code",
            {
                method: "POST",
                body: JSON.stringify({
                    p_referral_code: referralCode
                })
            }
        );

    if (referrer.ok && referrer.data) {
        referredBy = referrer.data;
    }
}

        // --------------------------------------
        // CREATE AUTH ACCOUNT
        // --------------------------------------

        const signup =
            await supabaseRequest(
                "/auth/v1/signup",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


        if (!signup.ok) {

            let errorMessage =
                "Unable to create account.";

            if (signup.data?.msg) {
                errorMessage =
                    signup.data.msg;
            }

            if (signup.data?.message) {
                errorMessage =
                    signup.data.message;
            }

            if (signup.data?.error_description) {
                errorMessage =
                    signup.data.error_description;
            }

            throw new Error(errorMessage);
        }


        const user =
            signup.data?.user ||
            signup.data;


        if (!user || !user.id) {

            throw new Error(
                "Account was created, but the user information could not be received."
            );

        }


        // --------------------------------------
        // GET NEW SESSION IF SUPABASE RETURNED ONE
        // --------------------------------------

        const signupAccessToken =
            signup.data?.access_token || null;

        if (signupAccessToken) {

            localStorage.setItem(
                "taskhub_access_token",
                signupAccessToken
            );

            if (signup.data?.refresh_token) {

                localStorage.setItem(
                    "taskhub_refresh_token",
                    signup.data.refresh_token
                );

            }

            localStorage.setItem(
                "taskhub_user_id",
                user.id
            );

            localStorage.setItem(
                "taskhub_email",
                user.email || email
            );

        }


        // --------------------------------------
        // CREATE PROFILE
        // --------------------------------------

        const profileHeaders = {
            "Prefer": "return=minimal"
        };


        if (signupAccessToken) {

            profileHeaders.Authorization =
                `Bearer ${signupAccessToken}`;

        }


        const profile =
            await supabaseRequest(
                "/rest/v1/profiles",
                {
                    method: "POST",

                    headers: profileHeaders,

                    body: JSON.stringify({
                        id: user.id,
                        full_name: name,
                        username,
                        phone,
                        balance: 0,
                        referral_code:
                            createReferralCode(username),
                        referred_by:
                            referredBy
                    })
                }
            );


        if (!profile.ok) {

            console.error(
                "Profile creation failed:",
                profile.data
            );


            // If Supabase requires email verification
            // before an authenticated profile insert,
            // do not pretend registration is complete.

            if (
                profile.status === 401 ||
                profile.status === 403
            ) {

                showMessage(
                    message,
                    "Your account was created, but your profile will be completed after email verification. Please verify your email, then log in.",
                    "error"
                );

            } else {

                showMessage(
                    message,
                    "Your account was created, but your profile could not be completed. Please contact support.",
                    "error"
                );

            }

            return;
        }


        // --------------------------------------
        // SUCCESS
        // --------------------------------------

        showMessage(
            message,
            "Account created successfully! Check your email if verification is required.",
            "success"
        );


        form.reset();


        // Restore referral code if needed
        // for display/state after reset.

        if (referralCode) {

            const referralField =
                document.getElementById("referralCode");

            if (referralField) {
                referralField.value =
                    referralCode;
            }

        }


        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 2500);


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        showMessage(
            message,
            error.message ||
            "Something went wrong while creating your account.",
            "error"
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                originalText;

        }

    }

}


// ==========================================
// LOGIN USER
// ==========================================

async function loginUser(event) {

    event.preventDefault();

    const form = event.target;

    const message =
        document.getElementById("authMessage");

    const email =
        document.getElementById("email")
            .value
            .trim()
            .toLowerCase();

    const password =
        document.getElementById("password")
            .value;


    if (!email || !password) {

        showMessage(
            message,
            "Please enter your email and password.",
            "error"
        );

        return;
    }


    const button =
        form.querySelector(
            "button[type='submit']"
        );

    const originalText =
        button ? button.textContent : "";


    if (button) {

        button.disabled = true;

        button.textContent =
            "Logging in...";

    }


    try {

        const login =
            await supabaseRequest(
                "/auth/v1/token?grant_type=password",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


        if (!login.ok) {

            let errorMessage =
                "Invalid email or password.";

            if (login.data?.msg) {
                errorMessage =
                    login.data.msg;
            }

            if (login.data?.message) {
                errorMessage =
                    login.data.message;
            }

            if (login.data?.error_description) {
                errorMessage =
                    login.data.error_description;
            }

            throw new Error(errorMessage);
        }


        if (
            !login.data?.access_token ||
            !login.data?.user?.id
        ) {

            throw new Error(
                "Login succeeded, but no valid session was returned."
            );

        }


        // --------------------------------------
        // SAVE SESSION
        // --------------------------------------

        localStorage.setItem(
            "taskhub_access_token",
            login.data.access_token
        );

        localStorage.setItem(
            "taskhub_refresh_token",
            login.data.refresh_token || ""
        );

        localStorage.setItem(
            "taskhub_user_id",
            login.data.user.id
        );

        localStorage.setItem(
            "taskhub_email",
            login.data.user.email || email
        );


        showMessage(
            message,
            "Login successful! Redirecting...",
            "success"
        );


        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 1000);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        showMessage(
            message,
            error.message ||
            "Unable to login.",
            "error"
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                originalText;

        }

    }

}


// ==========================================
// REFERRAL CODE GENERATOR
// ==========================================

function createReferralCode(username) {

    const random =
        Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase();

    return (
        username
            .substring(0, 6)
            .toUpperCase()
        + random
    );

}


// ==========================================
// MESSAGE DISPLAY
// ==========================================

function showMessage(
    element,
    text,
    type
) {

    if (!element) return;

    element.className =
        `auth-message ${type}`;

    element.textContent =
        text;

}


// ==========================================
// LOGOUT
// ==========================================

async function logoutUser() {

    const token =
        localStorage.getItem(
            "taskhub_access_token"
        );


    if (token) {

        try {

            await supabaseRequest(
                "/auth/v1/logout",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }


    localStorage.removeItem(
        "taskhub_access_token"
    );

    localStorage.removeItem(
        "taskhub_refresh_token"
    );

    localStorage.removeItem(
        "taskhub_user_id"
    );

    localStorage.removeItem(
        "taskhub_email"
    );


    window.location.href =
        "login.html";

}


// ==========================================
// CHECK LOGIN
// ==========================================

function isLoggedIn() {

    return !!localStorage.getItem(
        "taskhub_access_token"
    );

}


// ==========================================
// PROTECT PAGE
// ==========================================

function requireLogin() {

    if (!isLoggedIn()) {

        window.location.href =
            "login.html";

        return false;
    }

    return true;

}


// ==========================================
// AGENT DASHBOARD BUTTON
// ==========================================

async function loadAgentButton() {

    const container =
        document.getElementById(
            "agentDashboardButton"
        );

    if (!container) return;


    const userId =
        localStorage.getItem(
            "taskhub_user_id"
        );

    const token =
        localStorage.getItem(
            "taskhub_access_token"
        );


    if (!userId || !token) {

        container.innerHTML = `
            <a
                href="agent.html"
                class="dashboard-btn"
                style="display:block;text-align:center;background:white;color:#5b5cf0;"
            >
                Become an Agent
            </a>
        `;

        return;

    }


    try {

        const agents =
            await supabaseRequest(
                "/rest/v1/taskhub_agents" +
                "?select=id,status" +
                "&user_id=eq." +
                encodeURIComponent(userId) +
                "&status=eq.active" +
                "&limit=1"
            );


        if (
            agents.ok &&
            Array.isArray(agents.data) &&
            agents.data.length > 0
        ) {

            container.innerHTML = `
                <a
                    href="agent-dashboard.html"
                    class="dashboard-btn"
                    style="display:block;text-align:center;background:white;color:#5b5cf0;"
                >
                    Agent Dashboard
                </a>
            `;

        } else {

            container.innerHTML = `
                <a
                    href="agent.html"
                    class="dashboard-btn"
                    style="display:block;text-align:center;background:white;color:#5b5cf0;"
                >
                    Become an Agent
                </a>
            `;

        }

    } catch (error) {

        console.error(
            "Agent button error:",
            error
        );

        container.innerHTML = `
            <a
                href="agent.html"
                class="dashboard-btn"
                style="display:block;text-align:center;background:white;color:#5b5cf0;"
            >
                Become an Agent
            </a>
        `;

    }

}


// ==========================================
// AUTO-LOAD AGENT BUTTON
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAgentButton();

    }
);