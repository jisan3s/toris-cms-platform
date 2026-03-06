const PERMISSION_KEYS = ["home", "about", "blog", "services", "projects"];

const emptyPermissions = () => ({
    home: false,
    about: false,
    blog: false,
    services: false,
    projects: false
});

const fullPermissions = () => ({
    home: true,
    about: true,
    blog: true,
    services: true,
    projects: true
});

const normalizePermissions = (permissions = {}, fallback = emptyPermissions()) => {
    const normalized = { ...fallback };

    PERMISSION_KEYS.forEach((key) => {
        if (typeof permissions[key] === "boolean") {
            normalized[key] = permissions[key];
        }
    });

    return normalized;
};

module.exports = {
    PERMISSION_KEYS,
    emptyPermissions,
    fullPermissions,
    normalizePermissions
};
