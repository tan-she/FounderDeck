import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { getMyProfile, updateProfile } from "../../api/profile";
import { toast } from "sonner";
import { API_BASE_URL } from "../../config/api";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    linkedin_url: "",
    github_url: "",
  });

  const [avatarFile, setAvatarFile]   = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [fetching, setFetching]       = useState(true);
  const fileInputRef = useRef();

  const isGoogleUser = !!user?.google_id;

  // Load current profile data
  useEffect(() => {
    getMyProfile()
      .then((profile) => {
        setForm({
          name:         profile.name         ?? "",
          email:        profile.email        ?? "",
          bio:          profile.bio          ?? "",
          phone:        profile.phone        ?? "",
          linkedin_url: profile.linkedin_url ?? "",
          github_url:   profile.github_url   ?? "",
        });
        setAvatarPreview(resolveAvatar(profile.avatar_url));
      })
      .finally(() => setFetching(false));
  }, []);

  const resolveAvatar = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar; // Google URL
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}/storage/${avatar}`; // stored file
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Strict 2MB limit to prevent PHP UPLOAD_ERR_INI_SIZE ("The avatar failed to upload" error)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar image must be smaller than 2MB.");
      e.target.value = ""; // Reset the input
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file)); // instant local preview
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "") data.append(k, v);
    });
    if (avatarFile) data.append("avatar", avatarFile);

    try {
      const result = await updateProfile(data);
      // Ensure we merge the updated user details with the token from the store
      const store = useAuthStore.getState();
      setUser(result.user, store.token); 
      toast.success("Profile updated!");
      navigate(-1); // go back
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((msgs) =>
          msgs.forEach((m) => toast.error(m))
        );
      } else {
        toast.error("Failed to update profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Edit Profile</h1>
      <p className="text-gray-500 text-sm mb-8">
        Update your public profile information.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Avatar ── */}
        <div className="flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden cursor-pointer ring-2 ring-orange-400 ring-offset-2"
            onClick={() => fileInputRef.current.click()}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                {form.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="text-sm font-medium text-orange-500 hover:underline"
            >
              Change photo
            </button>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG or WebP · Max 2 MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* ── Full Name ── */}
        <Field label="Full Name">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={inputCls}
          />
        </Field>

        {/* ── Email ── */}
        <Field
          label="Email address"
          hint={isGoogleUser ? "Linked via Google — cannot be changed." : null}
        >
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            disabled={isGoogleUser}
            placeholder="john@example.com"
            className={`${inputCls} ${isGoogleUser ? "opacity-50 cursor-not-allowed bg-gray-100" : ""}`}
          />
        </Field>

        {/* ── Bio ── */}
        <Field label="Bio" hint="Max 500 characters">
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            maxLength={500}
            placeholder="Tell investors or founders a bit about yourself..."
            className={`${inputCls} resize-none`}
          />
          <p className="text-xs text-gray-400 text-right mt-1">
            {form.bio.length}/500
          </p>
        </Field>

        {/* ── Phone ── */}
        <Field label="Phone number">
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className={inputCls}
          />
        </Field>

        {/* ── LinkedIn ── */}
        <Field label="LinkedIn URL">
          <input
            name="linkedin_url"
            type="url"
            value={form.linkedin_url}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/yourname"
            className={inputCls}
          />
        </Field>

        {/* ── GitHub ── */}
        <Field label="GitHub URL">
          <input
            name="github_url"
            type="url"
            value={form.github_url}
            onChange={handleChange}
            placeholder="https://github.com/yourname"
            className={inputCls}
          />
        </Field>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent";

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
