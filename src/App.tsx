import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  User,
  UserProfile,
  Listing,
  Message,
  Conversation,
  CompatibilityBreakdown,
  ViewingSchedule,
} from "./types";
import { formatPrice, SAMPLE_BULK_CSV, SAMPLE_BULK_JSON } from "./utils";
import {
  Search,
  SlidersHorizontal,
  MessageSquare,
  Sparkles,
  Upload,
  User as UserIcon,
  Plus,
  Trash2,
  Grid,
  Layers,
  Check,
  AlertCircle,
  X,
  FileText,
  MapPin,
  Clock,
  Briefcase,
  HelpCircle,
  HelpCircle as Shield,
  BadgeAlert,
  Loader2,
  Calendar,
  ShieldCheck,
  ExternalLink,
  Download,
} from "lucide-react";

export function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Custom login state variables
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Application tabs
  type Tab =
    | "discovery"
    | "matrix"
    | "messages"
    | "owner_dashboard"
    | "profile";
  const [activeTab, setActiveTab] = useState<Tab>("discovery");

  // Simulation state
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(
    null,
  );
  const [authToken, setAuthToken] = useState<string>("");

  // Listing Verification States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyingListingId, setVerifyingListingId] = useState<string | null>(
    null,
  );
  const [docType, setDocType] = useState("Property Deed");
  const [licenseNum, setLicenseNum] = useState("");
  const [verifyNotes, setVerifyNotes] = useState("");
  const [verificationSubmitting, setVerificationSubmitting] = useState(false);

  // Viewing Scheduler States
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingListing, setSchedulingListing] = useState<Listing | null>(
    null,
  );
  const [viewingDate, setViewingDate] = useState("2026-06-25");
  const [viewingTime, setViewingTime] = useState("14:00");
  const [viewingNotes, setViewingNotes] = useState("");
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [allSchedules, setAllSchedules] = useState<ViewingSchedule[]>([]);
  const [activeScheduleFilter, setActiveScheduleFilter] = useState<
    "all" | "pending" | "accepted"
  >("all");
  const [reschedulingActiveId, setReschedulingActiveId] = useState<
    string | null
  >(null);
  const [rescheduleTime, setRescheduleTime] = useState("15:00");
  const [selectedScheduleIdForView, setSelectedScheduleIdForView] = useState<
    string | null
  >(null);

  // New account sign up modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regType, setRegType] = useState<"seeker" | "tenant" | "owner">(
    "seeker",
  );
  const [regPhone, setRegPhone] = useState("");
  const [entryRole, setEntryRole] = useState<
    "seeker" | "tenant" | "owner" | null
  >(null);

  // Listings Discovery Page States
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(65000);
  const [selectedListingType, setSelectedListingType] = useState<
    "all" | "shared_stay" | "entire_unit"
  >("all");
  const [searchRadius, setSearchRadius] = useState<number>(25);
  // Center search point: Kochi, Kerala default coordinates
  const [searchLat, setSearchLat] = useState<number>(9.9312);
  const [searchLng, setSearchLng] = useState<number>(76.2673);

  // Compatibility Matrix View States
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [aiBreakdown, setAiBreakdown] = useState<CompatibilityBreakdown | null>(
    null,
  );
  const [loadingAi, setLoadingAi] = useState(false);

  // In-App Chat states
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [attachedMediaUrl, setAttachedMediaUrl] = useState("");

  // Owner Bulk Hub states
  const [bulkFormat, setBulkFormat] = useState<"csv" | "json">("csv");
  const [bulkInput, setBulkInput] = useState(SAMPLE_BULK_CSV);
  const [bulkInputCSV, setBulkInputCSV] = useState(SAMPLE_BULK_CSV);
  const [bulkInputJSON, setBulkInputJSON] = useState(SAMPLE_BULK_JSON);
  const [bulkStatus, setBulkStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [ownerListings, setOwnerListings] = useState<Listing[]>([]);
  const [showBulkImporter, setShowBulkImporter] = useState(false);

  // Individual new listing creation drawer/form state
  const [showNewListingModal, setShowNewListingModal] = useState(false);
  const [newListingTitle, setNewListingTitle] = useState("");
  const [newListingPrice, setNewListingPrice] = useState("1200");
  const [newListingDeposit, setNewListingDeposit] = useState("1200");
  const [newListingAddress, setNewListingAddress] = useState("");
  const [newListingRoomSize, setNewListingRoomSize] = useState("12' x 14'");
  const [newListingUtility, setNewListingUtility] = useState(
    "Divided evenly (~₹1,500)",
  );
  const [newListingFlatmates, setNewListingFlatmates] = useState("1");
  const [newListingUnitType, setNewListingUnitType] = useState<any>("1BHK");
  const [newListingPincode, setNewListingPincode] = useState("");
  const [newListingState, setNewListingState] = useState("");
  const [newListingCity, setNewListingCity] = useState("");
  const [newListingType, setNewListingType] = useState<
    "shared_stay" | "entire_unit"
  >("shared_stay");
  const [newListingDesc, setNewListingDesc] = useState("");
  const [newListingAmenities, setNewListingAmenities] = useState<string>(
    "Gym, Security, Central AC, High-speed Internet",
  );
  const [newListingGender, setNewListingGender] = useState<
    "Girls only" | "Boys only" | "No preference"
  >("No preference");
  const [newListingRestrictions, setNewListingRestrictions] = useState<string>(
    "No indoor smoking, No loud parties, Respect quiet hours",
  );
  const [newListingImg, setNewListingImg] = useState("");

  // Edit profile state
  const [editBio, setEditBio] = useState("");
  const [editAge, setEditAge] = useState(25);
  const [editGender, setEditGender] = useState("Male");
  const [editProfession, setEditProfession] = useState("Designer");
  const [editSmoker, setEditSmoker] = useState(false);
  const [editPetsAllowed, setEditPetsAllowed] = useState(true);
  const [editCleanliness, setEditCleanliness] = useState(4);
  const [editBudgetMin, setEditBudgetMin] = useState(800);
  const [editBudgetMax, setEditBudgetMax] = useState(1800);
  const [editDrinking, setEditDrinking] = useState<
    "never" | "socially" | "regularly"
  >("socially");
  const [editSleeping, setEditSleeping] = useState<
    "early_bird" | "night_owl" | "flexible"
  >("flexible");
  const [editWfh, setEditWfh] = useState<"office" | "hybrid" | "wfh">("hybrid");
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [profileSaveStatus, setProfileSaveStatus] = useState<string | null>(
    null,
  );

  // Platonic-Only Trust Reporting modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportedUser, setReportedUser] = useState<User | null>(null);
  const [reportReason, setReportReason] = useState(
    "Romantic solicitation / dating-like behavior",
  );
  const [reportDetails, setReportDetails] = useState("");

  // Load registered simulation users
  const loadUsersDetails = async (userIdToSelect?: string) => {
    try {
      const res = await fetch("/api/v1/auth/users");
      const data = await res.json();
      setAllUsers(data);
      if (userIdToSelect) {
        const token = authToken;
        if (token) {
          const profileRes = await fetch("/api/v1/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (profileRes.ok) {
            const dataProfile = await profileRes.json();
            setCurrentUser(dataProfile.user);
            setCurrentProfile(dataProfile.profile);
          }
        }
      }
    } catch (e) {
      console.error("Failed to query users list.", e);
    }
  };

  const loadInitialSession = async () => {
    const listRes = await fetch("/api/v1/auth/users")
      .then((r) => r.json())
      .catch(() => []);
    setAllUsers(listRes);
    await fetchListings();

    const token = authToken;
    if (token) {
      try {
        const res = await fetch("/api/v1/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setCurrentProfile(data.profile);
          setAuthToken("session");
          fetchConversations("session");
          fetchSchedulesOfUser("session");

          if (data.profile) {
            setEditBio(data.profile.bio || "");
            setEditAge(data.profile.age || 25);
            setEditGender(data.profile.gender || "Not Specified");
            setEditProfession(data.profile.profession || "Professional");
            setEditSmoker(data.profile.smoker || false);
            setEditPetsAllowed(data.profile.pets_allowed || false);
            setEditCleanliness(data.profile.cleanliness_level || 3);
            setEditBudgetMin(data.profile.budget_min || 500);
            setEditBudgetMax(data.profile.budget_max || 2000);
            setEditDrinking(data.profile.drinking || "socially");
            setEditSleeping(data.profile.sleeping_pattern || "flexible");
            setEditWfh(data.profile.wfh_status || "hybrid");
            setEditFullName(data.user.full_name || "");
            setEditPhone(data.user.phone_number || "");
          }

          if (location.pathname === "/" || location.pathname === "/login") {
            navigate(`/dashboard/${data.user.user_type}`);
          }
          return;
        }
      } catch (e) {
        console.error("Token restore failed", e);
      }
    }

    setAuthToken("");
    setCurrentUser(null);
    setCurrentProfile(null);
    if (
      location.pathname === "/" ||
      location.pathname.startsWith("/dashboard")
    ) {
      navigate("/login");
    }
  };

  useEffect(() => {
    loadInitialSession();
  }, []);

  // Synchronize router paths and enforce strict role checking
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/dashboard/")) {
      if (!currentUser) {
        // Wait for session loader to finish before taking action
        return;
      }
      const role = path.split("/")[2]; // 'seeker', 'tenant', 'owner'
      if (role && role !== currentUser.user_type) {
        // High level role-based route guard: redirect to forbidden page
        navigate("/forbidden");
        return;
      }
      // Set appropriate activeTab based on user role to keep rendering sync
      if (currentUser.user_type === "owner") {
        if (activeTab !== "owner_dashboard" && activeTab !== "profile") {
          setActiveTab("owner_dashboard");
        }
      } else if (currentUser.user_type === "tenant") {
        if (
          activeTab !== "matrix" &&
          activeTab !== "messages" &&
          activeTab !== "profile"
        ) {
          setActiveTab("matrix");
        }
      } else if (currentUser.user_type === "seeker") {
        if (
          activeTab !== "discovery" &&
          activeTab !== "matrix" &&
          activeTab !== "messages" &&
          activeTab !== "profile"
        ) {
          setActiveTab("discovery");
        }
      }
    } else if (path === "/login") {
      if (currentUser) {
        navigate(`/dashboard/${currentUser.user_type}`);
      }
    } else if (path === "/") {
      if (currentUser) {
        navigate(`/dashboard/${currentUser.user_type}`);
      } else {
        navigate("/login");
      }
    }
  }, [location.pathname, currentUser]);

  // Sync user info and load relative models
  const handleUserSwitch = async (userId: string, usersOverride?: User[]) => {
    const list = usersOverride || allUsers;
    const selected = list.find((u: User) => u.id === userId);
    if (!selected) return;

    try {
      // Simulate real cryptographic login to retrieve cryptographic session token
      const loginRes = await fetch("/api/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selected.email,
          password: selected.password || "password123",
        }),
      });
      if (!loginRes.ok) throw new Error("Simulation login failed");
      await loginRes.json();
      const sessionToken = "session";

      setAuthToken(sessionToken);
      // Fetch associated profile information using secured parameterless endpoint context
      const res = await fetch("/api/v1/profile", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const data = await res.json();
      if (data.profile) {
        setCurrentProfile(data.profile);
        // Prepopulate profile editor State variables
        setEditBio(data.profile.bio || "");
        setEditAge(data.profile.age || 25);
        setEditGender(data.profile.gender || "Not Specified");
        setEditProfession(data.profile.profession || "Professional");
        setEditSmoker(data.profile.smoker || false);
        setEditPetsAllowed(data.profile.pets_allowed || false);
        setEditCleanliness(data.profile.cleanliness_level || 3);
        setEditBudgetMin(data.profile.budget_min || 500);
        setEditBudgetMax(data.profile.budget_max || 2000);
        setEditDrinking(data.profile.drinking || "socially");
        setEditSleeping(data.profile.sleeping_pattern || "flexible");
        setEditWfh(data.profile.wfh_status || "hybrid");
        setEditFullName(selected.full_name || "");
        setEditPhone(selected.phone_number || "");
      }

      // Refresh context with token
      fetchListings();
      fetchConversations(sessionToken);
      fetchSchedulesOfUser(sessionToken);
      setSelectedMatch(null);
      setAiBreakdown(null);

      // Sync active view tab if unsupported by the new user role
      if (selected.user_type === "owner") {
        if (activeTab !== "owner_dashboard" && activeTab !== "profile") {
          setActiveTab("owner_dashboard");
        }
      } else if (selected.user_type === "tenant") {
        if (
          activeTab !== "matrix" &&
          activeTab !== "messages" &&
          activeTab !== "profile"
        ) {
          setActiveTab("matrix");
        }
      } else if (selected.user_type === "seeker") {
        if (
          activeTab !== "discovery" &&
          activeTab !== "matrix" &&
          activeTab !== "messages" &&
          activeTab !== "profile"
        ) {
          setActiveTab("discovery");
        }
      }

      // Finalize simulation state updates concurrently to prevent intermediate mismatched URL checks in route guards
      setCurrentUser(selected);

      // Programmatically redirect to their designated dashboard layout
      navigate("/dashboard/" + selected.user_type, { replace: true });
    } catch (e) {
      console.error("Error fetching user profile", e);
    }
  };

  // Fetch Listings based on current search parameters
  const fetchListings = async () => {
    try {
      const typeParam =
        selectedListingType !== "all" ? `type=${selectedListingType}` : "";
      const minMaxParam = `max_price=${maxPrice}`;
      const searchParam = searchQuery
        ? `search=${encodeURIComponent(searchQuery)}`
        : "";
      const geoParam = `lat=${searchLat}&lng=${searchLng}&radius=${searchRadius}`;

      const query = [typeParam, minMaxParam, searchParam, geoParam]
        .filter(Boolean)
        .join("&");

      const res = await fetch(`/api/v1/listings?${query}`);
      const data = await res.json();
      setListings(data);

      // Auto-select first item if none is selected
      if (data.length > 0) {
        setSelectedListing(data[0]);
      } else {
        setSelectedListing(null);
      }
    } catch (e) {
      console.error("Failed to query listings.", e);
    }
  };

  // Run dynamic queries whenever the filtering slider updates
  useEffect(() => {
    fetchListings();
  }, [
    selectedListingType,
    maxPrice,
    searchRadius,
    searchLat,
    searchLng,
    searchQuery,
  ]);

  // Auto-pan coordinates based on text search query keywords
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q.includes("kochi") || q.includes("ernakulam")) {
      setSearchLat(9.9312);
      setSearchLng(76.2673);
    } else if (q.includes("trivandrum") || q.includes("thiruvananthapuram")) {
      setSearchLat(8.5241);
      setSearchLng(76.9366);
    } else if (q.includes("kozhikode") || q.includes("calicut")) {
      setSearchLat(11.2588);
      setSearchLng(75.7804);
    } else if (q.includes("thrissur")) {
      setSearchLat(10.5276);
      setSearchLng(76.2144);
    } else if (q.includes("alappuzha") || q.includes("alleppey")) {
      setSearchLat(9.4981);
      setSearchLng(76.3388);
    } else if (
      q.includes("bengaluru") ||
      q.includes("bangalore") ||
      q.includes("indiranagar")
    ) {
      setSearchLat(12.9716);
      setSearchLng(77.5946);
    } else if (
      q.includes("brooklyn") ||
      q.includes("new york") ||
      q.includes("ny")
    ) {
      setSearchLat(40.7128);
      setSearchLng(-74.006);
    }
  }, [searchQuery]);

  // Load Compatibility Matches
  const loadCompatibilityMatches = async () => {
    const token = authToken || "";
    if (!currentUser || !token) return;
    try {
      const res = await fetch("/api/v1/matches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMatches(data);
      if (data.length > 0) {
        setSelectedMatch(data[0]);
        triggerAiConsultation(currentUser.id, data[0].user.id);
      } else {
        setSelectedMatch(null);
        setAiBreakdown(null);
      }
    } catch (e) {
      console.error("Error requesting compatibility score breakdown", e);
    }
  };

  // Reload compatibility matrix when tab changes to matrix
  useEffect(() => {
    if (activeTab === "matrix") {
      loadCompatibilityMatches();
    } else if (activeTab === "owner_dashboard" && currentUser) {
      fetchOwnerListings();
    }
  }, [activeTab, currentUser]);

  const fetchOwnerListings = async () => {
    const token = authToken || "";
    if (!currentUser || !token) return;
    try {
      const res = await fetch("/api/v1/listings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Filter current owner's active properties
      const owned = data.filter((l: Listing) => l.owner_id === currentUser.id);
      setOwnerListings(owned);
    } catch (e) {
      console.error("Failed to grab owner inventory.", e);
    }
  };

  // AI powered review
  const triggerAiConsultation = async (seekerId: string, tenantId: string) => {
    const token = authToken || "";
    setLoadingAi(true);
    setAiBreakdown(null);
    try {
      const res = await fetch("/api/v1/ai/compatibility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ seekerId, tenantId }),
      });
      const data = await res.json();
      setAiBreakdown(data);
    } catch (e) {
      console.error("AI consultation call dropped", e);
    } finally {
      setLoadingAi(false);
    }
  };

  // Grab Messages & Active conversations
  const fetchConversations = async (tokenOverride?: string) => {
    const token = tokenOverride || authToken || "";
    if (!token) return;
    try {
      const res = await fetch("/api/v1/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data);
    } catch (e) {
      console.error("Failed reading conversations.", e);
    }
  };

  // Grab active schedules for a user
  const fetchSchedulesOfUser = async (tokenOverride?: string) => {
    const token = tokenOverride || authToken || "";
    if (!token) return;
    try {
      const res = await fetch("/api/v1/schedules", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAllSchedules(data);
    } catch (e) {
      console.error("Failed reading scheduled appointments.", e);
    }
  };

  // Submit appointment proposal
  const handleProposeSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = authToken || "";
    if (!currentUser || !schedulingListing || !token) return;

    setScheduleSubmitting(true);
    try {
      const proposedDateTime = `${viewingDate}T${viewingTime}`;
      const res = await fetch("/api/v1/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listing_id: schedulingListing.id,
          proposed_time: proposedDateTime,
          notes: viewingNotes,
        }),
      });

      if (res.ok) {
        setShowScheduleModal(false);
        setViewingNotes("");
        fetchSchedulesOfUser(token);
        alert(
          "Success! Your viewing appointment proposal has been recorded. An audit alert has been automatically sent to host chat channel.",
        );
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to submit viewing proposal.");
      }
    } catch (e) {
      console.error("Propose schedule error", e);
    } finally {
      setScheduleSubmitting(false);
    }
  };

  // Handle schedule accept / decline / reschedule actions
  const handleUpdateScheduleStatus = async (
    bookingId: string,
    status: string,
    notes?: string,
    time?: string,
  ) => {
    const token = authToken || "";
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/schedules/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          notes: notes || undefined,
          proposed_time: time || undefined,
        }),
      });

      if (res.ok) {
        if (currentUser) {
          fetchSchedulesOfUser(token);
        }
        setReschedulingActiveId(null);
        alert(
          `Schedule status has been updated to ${status.toUpperCase()}! A confirmation receipt has been sent to Chat.`,
        );
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to update viewing booking.");
      }
    } catch (e) {
      console.error("Update schedule status error", e);
    }
  };

  // Export as ICS Calendar File for local integration
  const handleExportICS = (sched: ViewingSchedule) => {
    const startIso = sched.proposed_time;
    const dateObj = new Date(startIso);
    // 1-hour appointment by default
    const endObj = new Date(dateObj.getTime() + 60 * 60 * 1000);

    const formatICSDate = (dt: Date) => {
      return dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//FlatMatch//Viewing Scheduler Board//EN",
      "BEGIN:VEVENT",
      `UID:flatmatch-${sched.id}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(dateObj)}`,
      `DTEND:${formatICSDate(endObj)}`,
      `SUMMARY:FlatMatch Room Space Tour: ${sched.listing_title}`,
      `DESCRIPTION:Viewing Scheduled on FlatMatch!\\nHost Landlord: ${sched.host_name}\\nRoom Seeker: ${sched.seeker_name}\\nContext Notes: ${sched.notes || "None"}\\nViewing Status: ${sched.status.toUpperCase()}`,
      `LOCATION:${sched.listing_address}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `flatmatch-tour-${sched.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Calendar Integration URL
  const getGoogleCalendarUrl = (sched: ViewingSchedule) => {
    const dateObj = new Date(sched.proposed_time);
    const endObj = new Date(dateObj.getTime() + 60 * 60 * 1000);

    const formatGCalDate = (dt: Date) => {
      return dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const title = encodeURIComponent(`FlatMatch Tour: ${sched.listing_title}`);
    const dates = `${formatGCalDate(dateObj)}/${formatGCalDate(endObj)}`;
    const details = encodeURIComponent(
      `Viewing Scheduled on FlatMatch!\nHost: ${sched.host_name}\nSeeker: ${sched.seeker_name}\nNotes: ${sched.notes || "None"}\nJoin FlatMatch at flatmatch.com`,
    );
    const location = encodeURIComponent(sched.listing_address);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  // Submit Listing Verification Process
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = authToken || "";
    if (!verifyingListingId || !token) return;

    const licenseClean = licenseNum.replace(/[\s-]/g, "");
    if (docType === "Aadhaar") {
      if (!/^\d{12}$/.test(licenseClean)) {
        alert(
          "Invalid Aadhaar Card form. Must specify a 12-digit number (e.g., 9012 3456 7890).",
        );
        return;
      }
    } else if (docType === "PAN") {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(licenseClean)) {
        alert(
          "Invalid PAN format. Must be a 10-character alphanumeric string (e.g., ABCDE1234F).",
        );
        return;
      }
    }

    setVerificationSubmitting(true);
    try {
      const isSelfKyc = verifyingListingId === "seeker_profile";
      const url = isSelfKyc
        ? "/api/v1/auth/verify-kyc"
        : `/api/v1/listings/${verifyingListingId}/verify`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_type: docType,
          license_number: licenseClean,
          notes: verifyNotes,
        }),
      });

      const rawJson = await res.json();

      if (res.ok) {
        setShowVerifyModal(false);
        setLicenseNum("");
        setVerifyNotes("");

        if (isSelfKyc) {
          if (rawJson.user) {
            setCurrentUser(rawJson.user);
          } else if (currentUser) {
            setCurrentUser({ ...currentUser, is_verified: true });
          }
          alert(
            "KYC verified instantly! Your account identity is now APPROVED under UIDAI / Income Tax department audit.",
          );
        } else {
          fetchListings();
          if (currentUser && currentUser.user_type === "owner") {
            fetchOwnerListings();
          }
          alert(
            "Paperwork filed! Your listing verification request is now PENDING review. Admin can instantly approve this in your Owner Bulk Hub (Approvals on Active Catalog list).",
          );
        }
      } else {
        alert(rawJson.error || "Failed to file verification paperwork.");
      }
    } catch (e) {
      console.error("Submit verification error", e);
    } finally {
      setVerificationSubmitting(false);
    }
  };

  // Administrative Simulative Instantly Approve Verifications
  const handleApproveVerificationSim = async (listingId: string) => {
    const token = authToken || "";
    if (!token) return;
    try {
      const res = await fetch(
        `/api/v1/listings/${listingId}/approve_verification`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.ok) {
        fetchListings();
        if (currentUser && currentUser.user_type === "owner") {
          fetchOwnerListings();
        }
        alert(
          "Instant Administrative Approval Executed! Verified Badge of honor is now applied live.",
        );
      }
    } catch (e) {
      console.error("Instant approve catalog simulation crashed", e);
    }
  };

  const fetchActiveChatMessages = async (partnerId: string) => {
    const token = authToken || "";
    if (!currentUser || !token) return;
    try {
      const res = await fetch(
        `/api/v1/chat/conversations/${partnerId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setChatMessages(data);
    } catch (e) {
      console.error("Error reading chat window.", e);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    fetchActiveChatMessages(conv.participant.id);
  };

  // Quick Action to kick-off chat dialogue with flat owners
  const handleInitiateChat = async (receiverId: string) => {
    const token = authToken || "";
    if (!currentUser || !token) return;

    // Check if conversation already exists or build a simple intro message immediately
    const existing = conversations.find((c) => c.participant.id === receiverId);
    if (existing) {
      setActiveConversation(existing);
      fetchActiveChatMessages(receiverId);
      setActiveTab("messages");
      return;
    }

    try {
      // Send a default ice breaker
      const initialText = `Hi! I saw your FlatMatch listing for "${selectedListing?.title}" and am heavily interested! I'd love to connect and chat about roommate compatibility when you have a moment. Thanks!`;
      await fetch("/api/v1/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          message_text: initialText,
        }),
      });

      // Reload channels, select active tab and spotlight the screen
      await fetchConversations(token);
      setActiveTab("messages");

      // Attempt to auto-select this newly injected conversation channel
      const resCon = await fetch("/api/v1/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const listCon: Conversation[] = await resCon.json();
      const matchNew = listCon.find((c) => c.participant.id === receiverId);
      if (matchNew) {
        setActiveConversation(matchNew);
        fetchActiveChatMessages(receiverId);
      }
    } catch (e) {
      console.error("Failed to trigger chat initialization.", e);
    }
  };

  // Post Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = authToken || "";
    if (!currentUser || !activeConversation || !newMessageText.trim() || !token)
      return;

    try {
      const payload = {
        receiver_id: activeConversation.participant.id,
        message_text: newMessageText,
      };

      const res = await fetch("/api/v1/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to send message.");
        return;
      }

      // append straight to view for instant speed
      setChatMessages((prev: Message[]) => [...prev, data]);
      setNewMessageText("");
      setAttachedMediaUrl("");

      // Refresh parent conversation list previews
      fetchConversations(token);

      // Simulation - Auto Responder trigger representing a flatmate
      setTimeout(async () => {
        let responderText =
          "That sounds great! Let me review my schedule and get back to you with flatmate viewing slots.";
        if (
          newMessageText.toLowerCase().includes("view") ||
          newMessageText.toLowerCase().includes("free")
        ) {
          responderText =
            "I'm actually available tomorrow evening! Would you love to hop on a zoom call or check out the neighborhood layout direct?";
        } else if (
          newMessageText.toLowerCase().includes("pets") ||
          newMessageText.toLowerCase().includes("dog") ||
          newMessageText.toLowerCase().includes("cat")
        ) {
          responderText =
            "I completely adore animals! There is a gorgeous garden backyard with plenty of space to run around.";
        }

        const simToken = authToken; // Use same session
        // Simulated auto-response gets its own sender/receiver context from respective account (handled simulated on backend)
        await fetch("/api/v1/chat/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${simToken}`, // simulation helper continues using token
          },
          body: JSON.stringify({
            receiver_id: currentUser.id,
            message_text: `${responderText} (Simulation Autoresp)`,
          }),
        });

        // Pull fresh window
        fetchActiveChatMessages(activeConversation.participant.id);
        fetchConversations(token);
      }, 2500);
    } catch (e) {
      console.error("Failed to post feedback message", e);
    }
  };

  // Post Individual Property Listing (Owner dashboard or Tenants)
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!newListingRestrictions.trim()) {
      alert(
        "At least one house restriction is mandatory. Please specify guidelines before saving.",
      );
      return;
    }

    const pinClean = newListingPincode.trim();
    if (!newListingCity.trim() || !newListingState.trim() || !pinClean) {
      alert(
        "Indian regulatory compliance requires mandatory City, State, and 6-digit Pincode fields.",
      );
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(pinClean)) {
      alert(
        "Invalid Pincode structure. Must be a 6-digit Indian Postal PIN Code not starting with 0.",
      );
      return;
    }

    try {
      const payload = {
        owner_id: currentUser.id,
        title: newListingTitle,
        description:
          newListingDesc || `Beautifully prepared room for FlatMatch Seekers.`,
        listing_type: newListingType,
        price_per_month: Number(newListingPrice),
        deposit: Number(newListingDeposit),
        address: newListingAddress || "Indiranagar, Bengaluru, Karnataka",
        pincode: pinClean,
        state: newListingState.trim(),
        city: newListingCity.trim(),
        available_from: new Date().toISOString().split("T")[0],
        room_size:
          newListingType === "shared_stay" ? newListingRoomSize : undefined,
        utility_split:
          newListingType === "shared_stay" ? newListingUtility : undefined,
        current_flatmate_count:
          newListingType === "shared_stay"
            ? Number(newListingFlatmates)
            : undefined,
        apartment_type:
          newListingType === "entire_unit" ? newListingUnitType : undefined,
        gender_preference: newListingGender,
        house_restrictions: newListingRestrictions
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        amenities: newListingAmenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        image_urls: newListingImg ? [newListingImg] : [],
      };

      const res = await fetch("/api/v1/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken || ""}`,
        },
        body: JSON.stringify(payload),
      });

      const rawData = await res.json();
      if (!res.ok) {
        alert(
          rawData.error ||
            "Failed to submit listing. Please complete all fields.",
        );
        return;
      }

      setShowNewListingModal(false);
      // Reset properties
      setNewListingTitle("");
      setNewListingPrice("15000");
      setNewListingDeposit("25000");
      setNewListingAddress("");
      setNewListingPincode("");
      setNewListingState("");
      setNewListingCity("");
      setNewListingDesc("");
      setNewListingImg("");
      setNewListingGender("No preference");
      setNewListingRestrictions(
        "No indoor smoking, No loud parties, Respect quiet hours",
      );

      // Refresh lists
      fetchListings();
      if (currentUser.user_type === "owner") {
        fetchOwnerListings();
      }
    } catch (e) {
      console.error("Failed submitting listing to database.", e);
    }
  };

  // Interactive Map click simulations: Change search coordinates to point location of that listing
  const handleMapPinSelect = (listing: Listing) => {
    setSelectedListing(listing);
    setSearchLat(listing.latitude);
    setSearchLng(listing.longitude);
  };

  // Perform User Registration
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLFormElement;
    const formData = new FormData(target);
    const nameVal = (formData.get("full_name") as string) || regName;
    const emailVal = (formData.get("email") as string) || regEmail;
    const phoneVal = (formData.get("phone_number") as string) || regPhone;
    const typeVal =
      (formData.get("user_type") as "seeker" | "tenant" | "owner") || regType;
    const passwordVal = (formData.get("password") as string) || "password123";

    if (!nameVal || !emailVal) {
      alert("Full Name and Email address are required fields.");
      return;
    }

    if (!phoneVal) {
      alert("Mobile number with +91 country code is mandatory.");
      return;
    }

    const cleanPhone = phoneVal.replace(/[\s-()]/g, "");
    if (!cleanPhone.startsWith("+91")) {
      alert(
        "Mobile number must start with +91 country code for the Indian market.",
      );
      return;
    }
    const mobileWithoutCode = cleanPhone.substring(3);
    if (!/^[6-9]\d{9}$/.test(mobileWithoutCode)) {
      alert(
        "Please provide a valid 10-digit Indian mobile number following the +91 country code.",
      );
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailVal,
          full_name: nameVal,
          password: passwordVal,
          user_type: typeVal,
          phone_number: cleanPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit registration data.");
        return;
      }

      setAuthToken("session");
      setCurrentUser(data.user);
      setCurrentProfile(data.profile);

      // Refresh data models
      fetchConversations("session");
      fetchSchedulesOfUser("session");
      fetchListings();

      // Reset inputs and state
      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setIsSignUpMode(false);
      setShowRegisterModal(false);

      // Redirect programmatically
      navigate(`/dashboard/${data.user.user_type}`);
    } catch (e) {
      console.error("Error conducting registration.", e);
    }
  };

  // Soft Deactivate Listing Item
  const handleDeleteListing = async (listingId: string) => {
    if (
      !confirm(
        "Are you sure you want to deactivate and remove this property listing from the live search database?",
      )
    )
      return;
    const token = authToken || "";
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/listings/${listingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchListings();
        fetchOwnerListings();
      }
    } catch (e) {
      console.error("Failed to flag-down listing.", e);
    }
  };

  const handleShowReportUserModal = (user: User) => {
    setReportedUser(user);
    setReportReason("Romantic solicitation / dating-like behavior");
    setReportDetails("");
    setShowReportModal(true);
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !reportedUser) return;
    try {
      const res = await fetch("/api/v1/users/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporter_id: currentUser.id,
          reported_id: reportedUser.id,
          reason: reportReason,
          details: reportDetails,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(
          data.alert ||
            "Your report was successfully filed with the FlatMatch Trust & Safety Team.",
        );
        setShowReportModal(false);
      }
    } catch (e) {
      console.error("Failed submitting platform report", e);
      alert("Network issue filing safety report.");
    }
  };

  // Save modified user profile preferences
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = authToken || "";
    if (!currentUser || !token) return;

    setProfileSaveStatus("updating");
    try {
      const res = await fetch("/api/v1/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio: editBio,
          age: editAge,
          gender: editGender,
          profession: editProfession,
          smoker: editSmoker,
          pets_allowed: editPetsAllowed,
          cleanliness_level: editCleanliness,
          budget_min: editBudgetMin,
          budget_max: editBudgetMax,
          drinking: editDrinking,
          sleeping_pattern: editSleeping,
          wfh_status: editWfh,
          full_name: editFullName,
          phone_number: editPhone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentProfile(data.profile);

        // Update user state locally too to prevent mismatch headings
        setCurrentUser(data.user);

        // Refresh registered users listing
        const resUsr = await fetch("/api/v1/auth/users");
        const dataUsr = await resUsr.json();
        setAllUsers(dataUsr);

        setProfileSaveStatus("success");
        setTimeout(() => setProfileSaveStatus(null), 3000);
      } else {
        setProfileSaveStatus("error");
      }
    } catch (e) {
      console.error("Error saving updated preferences matrix", e);
      setProfileSaveStatus("error");
    }
  };

  // Adopt another user's preference details
  const handleAdoptPreferences = async (targetProfile: UserProfile) => {
    const token = authToken || "";
    if (!currentUser || !token) return;

    try {
      const res = await fetch("/api/v1/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio: editBio,
          age: editAge,
          gender: editGender,
          profession: editProfession,
          smoker: targetProfile.smoker ?? editSmoker,
          pets_allowed: targetProfile.pets_allowed ?? editPetsAllowed,
          cleanliness_level: targetProfile.cleanliness_level ?? editCleanliness,
          budget_min: targetProfile.budget_min ?? editBudgetMin,
          budget_max: targetProfile.budget_max ?? editBudgetMax,
          drinking: targetProfile.drinking ?? editDrinking,
          sleeping_pattern: targetProfile.sleeping_pattern ?? editSleeping,
          wfh_status: targetProfile.wfh_status ?? editWfh,
          full_name: editFullName,
          phone_number: editPhone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentProfile(data.profile);
        setCurrentUser(data.user);

        // Prepopulate edit states locally
        setEditSmoker(data.profile.smoker || false);
        setEditPetsAllowed(data.profile.pets_allowed || false);
        setEditCleanliness(data.profile.cleanliness_level || 3);
        setEditBudgetMin(data.profile.budget_min || 500);
        setEditBudgetMax(data.profile.budget_max || 2000);
        setEditDrinking(data.profile.drinking || "socially");
        setEditSleeping(data.profile.sleeping_pattern || "flexible");
        setEditWfh(data.profile.wfh_status || "hybrid");

        // Refresh registered users list
        const resUsr = await fetch("/api/v1/auth/users");
        const dataUsr = await resUsr.json();
        setAllUsers(dataUsr);

        // Refresh compatibility matches
        loadCompatibilityMatches();

        alert(
          "Success! Your matching preferences have been updated to match this user's profile details.",
        );
      } else {
        alert("Failed to update preferences matrix.");
      }
    } catch (e) {
      console.error("Error adopting preferences", e);
      alert("Network error updating preferences.");
    }
  };

  // Perform Bulk csv or bulk json upload
  const handleBulkUpload = async () => {
    if (!currentUser) return;
    setBulkStatus(null);
    try {
      let parsedData: any[] = [];

      if (bulkFormat === "json") {
        const cleaned = bulkInput.trim();
        parsedData = JSON.parse(cleaned);
      } else {
        // Simple manual CSV parser mapping columns
        const lines = bulkInput
          .split("\n")
          .filter((l: string) => l.trim() !== "");
        if (lines.length < 2) {
          throw new Error(
            "Invalid CSV format. Need header and at least 1 record row.",
          );
        }

        // Extremely simple parser mapping headers: title,description,listing_type,price_per_month,deposit,address,latitude,longitude,apartment_type,amenities,image_urls
        // We'll strip surrounding quotes if present
        const headers = lines[0]
          .split(",")
          .map((h: string) => h.trim().replace(/^["']|["']$/g, ""));

        parsedData = lines.slice(1).map((line: string) => {
          // Robust regex to split commas but ignore commas inside quoted segments
          const cells: string[] = [];
          let currentStr = "";
          let insideQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' || char === "'") {
              insideQuotes = !insideQuotes;
            } else if (char === "," && !insideQuotes) {
              cells.push(currentStr.trim().replace(/^["']|["']$/g, ""));
              currentStr = "";
            } else {
              currentStr += char;
            }
          }
          cells.push(currentStr.trim().replace(/^["']|["']$/g, ""));

          const item: any = {};
          headers.forEach((header: string, index: number) => {
            item[header] = cells[index] || "";
          });
          return item;
        });
      }

      const res = await fetch("/api/v1/listings/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken || ""}`,
        },
        body: JSON.stringify({
          ownerId: currentUser.id,
          data: parsedData,
        }),
      });

      const reply = await res.json();
      if (res.ok) {
        setBulkStatus({
          type: "success",
          message: `Successfully batch-imported ${reply.count} high-density properties to your active flat index!`,
        });
        fetchListings();
        fetchOwnerListings();
      } else {
        setBulkStatus({
          type: "error",
          message:
            reply.error ||
            "Batch upload failed. Verify the syntax format correctness.",
        });
      }
    } catch (e: any) {
      setBulkStatus({
        type: "error",
        message:
          e.message || "Crucial error occurred parsing input file structure.",
      });
    }
  };

  // Force-Upgrade/Switch plan simulation
  const handleUpgradeTier = async (targetTier: string) => {
    const token = authToken || "";
    if (!currentUser || !token) return;

    try {
      const res = await fetch("/api/v1/auth/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: currentUser.id, tier: targetTier }),
      });
      if (res.ok) {
        // refresh list of all users and then trigger user state update
        await loadUsersDetails(currentUser.id);
      }
    } catch (e) {
      console.error("Upgrade tier error", e);
    }
  };

  if (location.pathname === "/login") {
    if (entryRole === null) {
      return (
        <div className="w-[1024px] h-[768px] bg-[#E4E3E0] text-[#141414] font-sans overflow-hidden flex flex-col justify-center items-center border-[8px] border-[#141414] mx-auto relative shadow-2xl">
          <div className="text-center mb-8">
            <span className="inline-block font-extrabold tracking-tighter text-3xl bg-[#141414] text-white px-6 py-2 border-2 border-[#141414] uppercase shadow-[4px_4px_0px_#FAF9F5]">
              🏢 FLATMATCH
            </span>
            <p className="text-xs font-serif italic text-neutral-600 mt-3 font-bold">
              Roommate Compatibility Matrix & Smart Real-Estate Discovery
            </p>
          </div>

          <div className="flex gap-6 max-w-[920px] w-full px-4">
            {/* Seeker Card */}
            <div className="flex-1 bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_#141414] flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-200">
              <div>
                <div className="w-12 h-12 bg-[#D2F57C] border-2 border-[#141414] flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-[#141414]" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">
                  Room Seeker
                </h3>
                <p className="text-[10px] font-mono uppercase text-zinc-500 mb-3">
                  Looking for a home
                </p>
                <p className="text-xs text-neutral-650 leading-relaxed mb-4">
                  Browse shared stays and entire units geographically. Find
                  compatible roommates via our AI-powered matrix compatibility
                  engine.
                </p>
              </div>
              <button
                onClick={() => {
                  setEntryRole("seeker");
                  setRegType("seeker");
                }}
                className="w-full bg-[#141414] text-white hover:bg-neutral-800 text-[10px] font-mono font-bold py-2.5 border-2 border-[#141414] uppercase tracking-wider shadow-[3px_3px_0px_#D2F57C] cursor-pointer"
              >
                Enter Seeker Portal
              </button>
            </div>

            {/* Tenant Card */}
            <div className="flex-1 bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_#141414] flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-200">
              <div>
                <div className="w-12 h-12 bg-[#FCD34D] border-2 border-[#141414] flex items-center justify-center mb-4">
                  <UserIcon className="w-6 h-6 text-[#141414]" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">
                  Existing Tenant
                </h3>
                <p className="text-[10px] font-mono uppercase text-zinc-500 mb-3">
                  Have a stay, looking to share
                </p>
                <p className="text-xs text-neutral-650 leading-relaxed mb-4">
                  List your spare bedroom/shared flat. Review compatibility
                  scores of prospective flatmates and organize tours securely.
                </p>
              </div>
              <button
                onClick={() => {
                  setEntryRole("tenant");
                  setRegType("tenant");
                }}
                className="w-full bg-[#141414] text-white hover:bg-neutral-800 text-[10px] font-mono font-bold py-2.5 border-2 border-[#141414] uppercase tracking-wider shadow-[3px_3px_0px_#FCD34D] cursor-pointer"
              >
                Enter Tenant Portal
              </button>
            </div>

            {/* Property Owner Card */}
            <div className="flex-1 bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_#141414] flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-200">
              <div>
                <div className="w-12 h-12 bg-[#93C5FD] border-2 border-[#141414] flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-[#141414]" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">
                  Property Owner
                </h3>
                <p className="text-[10px] font-mono uppercase text-zinc-500 mb-3">
                  Landlord / Conglomerate
                </p>
                <p className="text-xs text-neutral-650 leading-relaxed mb-4">
                  Manage apartment complex units. Import listings in bulk via
                  CSV/JSON format, monitor landlord portfolios, and simulate
                  premium plans.
                </p>
              </div>
              <button
                onClick={() => {
                  setEntryRole("owner");
                  setRegType("owner");
                }}
                className="w-full bg-[#141414] text-white hover:bg-neutral-800 text-[10px] font-mono font-bold py-2.5 border-2 border-[#141414] uppercase tracking-wider shadow-[3px_3px_0px_#93C5FD] cursor-pointer"
              >
                Enter Owner Portal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-[1024px] h-[768px] bg-[#E4E3E0] text-[#141414] font-sans overflow-hidden flex flex-col justify-center items-center border-[8px] border-[#141414] mx-auto relative shadow-2xl">
        <div className="w-[450px] bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_#141414]">
          <div className="text-center mb-6">
            <span className="inline-block font-extrabold tracking-tighter text-2xl bg-[#141414] text-white px-4 py-1.5 border-2 border-[#141414] uppercase">
              FLATMATCH // {isSignUpMode ? "REGISTER" : "SECURE"}
            </span>
            <p className="text-xs font-serif italic text-neutral-600 mt-2 font-semibold">
              {isSignUpMode
                ? `Create Account: ${entryRole.toUpperCase()}`
                : `Authenticated Portal: ${entryRole.toUpperCase()}`}
            </p>
          </div>

          {/* Prominent 3-way toggle */}
          <div className="flex border-2 border-[#141414] mb-6 p-1 bg-[#F5F5F3]">
            {[
              { key: "seeker", label: "Seeker" },
              { key: "tenant", label: "Tenant" },
              { key: "owner", label: "Owner" },
            ].map((role) => {
              const isActive = entryRole === role.key;
              return (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => {
                    setEntryRole(role.key as any);
                    setRegType(role.key as any);
                  }}
                  className={`flex-1 text-[10px] font-bold py-1.5 uppercase transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-[#141414] text-white border border-[#141414] shadow-sm"
                      : "text-[#141414] hover:bg-neutral-200"
                  }`}
                >
                  {role.label}
                </button>
              );
            })}
          </div>

          {loginError && (
            <div className="bg-red-50 border-2 border-red-500 p-3 mb-4 text-xs text-red-900 font-mono font-bold leading-tight">
              ERROR: {loginError}
            </div>
          )}

          {!isSignUpMode ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoginLoading(true);
                setLoginError(null);
                try {
                  const res = await fetch("/api/v1/auth/login", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: loginEmail,
                      password: loginPassword,
                    }),
                  });
                  const reply = await res.json();
                  if (res.ok) {
                    // Assert role restriction on login!
                    if (reply.user.user_type !== entryRole) {
                      throw new Error(
                        `This account is registered as an ${reply.user.user_type.toUpperCase()}. You are attempting to log in to the ${entryRole.toUpperCase()} portal. Access denied.`,
                      );
                    }

                    setAuthToken("session");
                    setCurrentUser(reply.user);
                    setCurrentProfile(reply.profile);

                    // Refresh data models
                    fetchConversations("session");
                    fetchSchedulesOfUser("session");
                    fetchListings();

                    // Prepopulate inputs
                    if (reply.profile) {
                      setEditBio(reply.profile.bio || "");
                      setEditAge(reply.profile.age || 25);
                      setEditGender(reply.profile.gender || "Not Specified");
                      setEditProfession(
                        reply.profile.profession || "Professional",
                      );
                      setEditSmoker(reply.profile.smoker || false);
                      setEditPetsAllowed(reply.profile.pets_allowed || false);
                      setEditCleanliness(reply.profile.cleanliness_level || 3);
                      setEditBudgetMin(reply.profile.budget_min || 500);
                      setEditBudgetMax(reply.profile.budget_max || 2000);
                      setEditDrinking(reply.profile.drinking || "socially");
                      setEditSleeping(
                        reply.profile.sleeping_pattern || "flexible",
                      );
                      setEditWfh(reply.profile.wfh_status || "hybrid");
                      setEditFullName(reply.user.full_name || "");
                      setEditPhone(reply.user.phone_number || "");
                    }

                    // Redirect programmatically
                    navigate(`/dashboard/${reply.user.user_type}`);
                  } else {
                    setLoginError(reply.error || "Authentication denied.");
                  }
                } catch (err: any) {
                  setLoginError(err.message || "Server connection failed.");
                } finally {
                  setLoginLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 text-[#141414]">
                  Account Email Address ({entryRole.toUpperCase()})
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full border-2 border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none hover:bg-neutral-50 focus:bg-white rounded-none leading-none"
                  placeholder={`e.g. ${entryRole}.alex@example.com`}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 text-[#141414]">
                  Account Secure Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full border-2 border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none hover:bg-neutral-50 focus:bg-white rounded-none leading-none"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-[#D2F57C] hover:bg-[#b8da64] text-xs font-mono font-bold py-2.5 border-2 border-[#141414] uppercase tracking-wider shadow-[4px_4px_0px_#141414] active:shadow-none translate-y-0 active:translate-y-[2px] transition-all cursor-pointer flex justify-center items-center gap-2"
              >
                {loginLoading
                  ? "Negotiating Access..."
                  : "Authenticate Credentials"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoginLoading(true);
                setLoginError(null);
                try {
                  await handleRegisterUser(e);
                } catch (err: any) {
                  setLoginError(err.message || "Registration failed.");
                } finally {
                  setLoginLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 text-[#141414]">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full border-2 border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none hover:bg-neutral-50 focus:bg-white rounded-none leading-none"
                  placeholder="e.g. Alex Johnson"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 text-[#141414]">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full border-2 border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none hover:bg-neutral-50 focus:bg-white rounded-none leading-none"
                  placeholder={`e.g. ${entryRole}@example.com`}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 text-[#141414]">
                  Account Secure Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full border-2 border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none hover:bg-neutral-50 focus:bg-white rounded-none leading-none"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1 text-[#141414]">
                  Indian Mobile Number (with +91)
                </label>
                <input
                  type="text"
                  name="phone_number"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full border-2 border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none hover:bg-neutral-50 focus:bg-white rounded-none leading-none"
                  placeholder="+919876543210"
                  required
                />
              </div>

              <input type="hidden" name="user_type" value={entryRole} />

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-[#D2F57C] hover:bg-[#b8da64] text-xs font-mono font-bold py-2.5 border-2 border-[#141414] uppercase tracking-wider shadow-[4px_4px_0px_#141414] active:shadow-none translate-y-0 active:translate-y-[2px] transition-all cursor-pointer flex justify-center items-center gap-2"
              >
                {loginLoading ? "Creating Account..." : "Register & Sign In"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center flex flex-col gap-2 border-t-2 border-dashed border-[#141414] pt-4">
            <button
              onClick={() => setIsSignUpMode(!isSignUpMode)}
              className="text-[11px] font-serif italic text-neutral-600 hover:text-[#141414] underline cursor-pointer"
            >
              {!isSignUpMode
                ? "Do not have an account? Register here"
                : "Already have an account? Sign In here"}
            </button>
            <button
              onClick={() => {
                setEntryRole(null);
                setIsSignUpMode(false);
              }}
              className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 hover:text-[#141414] mt-2 flex items-center justify-center gap-1 cursor-pointer"
            >
              ← Back to role portals
            </button>
          </div>
        </div>

        {/* Modal 1: Register custom profile needs to be rendered on Login screen too in case clicked! */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-[#141414]/80 flex items-center justify-center z-50 p-4">
            <div className="w-[500px] bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_#101010]">
              <div className="flex justify-between items-center pb-3 border-b border-[#141414] mb-3">
                <span className="font-extrabold text-xs uppercase tracking-wider font-mono">
                  Create Security Context ({regType?.toUpperCase()})
                </span>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="text-[#141414] hover:text-red-600 cursor-pointer"
                >
                  [CLOSE]
                </button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleRegisterUser(e);
                }}
                className="space-y-3.5 text-xs"
              >
                {/* Standard register fields */}
                <div>
                  <label className="block text-[9px] font-mono font-bold mb-1">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    className="w-full border border-[#141414] p-2 bg-[#F5F5F3]"
                    placeholder="e.g. Alex Johnson"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-mono font-bold mb-1">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full border border-[#141414] p-2 bg-[#F5F5F3]"
                      placeholder="e.g. seeker@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold mb-1">
                      SECURE PASSWORD
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      className="w-full border border-[#141414] p-2 bg-[#F5F5F3]"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-mono font-bold mb-1">
                      PROFILE CATEGORY
                    </label>
                    <select
                      name="user_type"
                      required
                      className="w-full border border-[#141414] p-2 bg-[#F5F5F3]"
                      value={regType}
                      onChange={(e) => setRegType(e.target.value as any)}
                    >
                      <option value="seeker">SEEKER (Roommate Seeker)</option>
                      <option value="tenant">
                        TENANT (Current Tenant with Room)
                      </option>
                      <option value="owner">
                        OWNER (Corporate Property Owner)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold mb-1">
                      INDIAN MOBILE (MUST START +91)
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      required
                      className="w-full border border-[#141414] p-2 bg-[#F5F5F3]"
                      placeholder="+919876543210"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#D2F57C] hover:bg-[#b8da64] border-2 border-[#141414] font-bold text-center py-2.5 uppercase text-xs"
                >
                  Register & Load Context
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (location.pathname === "/forbidden") {
    return (
      <div className="w-[1024px] h-[768px] bg-[#E4E3E0] text-[#141414] font-sans overflow-hidden flex flex-col justify-center items-center border-[8px] border-[#141414] mx-auto relative shadow-2xl">
        <div className="w-[480px] bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_#141414] text-center">
          <div className="text-red-600 flex justify-center mb-4">
            <span className="p-3 bg-red-100 rounded-none border-2 border-red-600 animate-pulse">
              <Shield className="w-12 h-12 stroke-[2.5]" />
            </span>
          </div>

          <h2 className="font-extrabold text-xl tracking-tighter uppercase mb-2 bg-red-600 text-white px-3 py-1 inline-block border-2 border-[#141414]">
            ACCESS RESTRICTED // RBAC_RULE_VIOLATION
          </h2>

          <p className="text-xs font-mono text-neutral-600 mt-4 leading-relaxed bg-[#FAF9F5] p-3 border border-neutral-300">
            Unauthorized profile structure category. The requested route
            sequence is strictly reserved for authenticated profiles utilizing
            distinct dashboard views. Seekers & tenants cannot explore corporate
            listing hub assets.
          </p>

          <div className="mt-8 flex flex-col gap-2">
            <button
              onClick={() => {
                if (currentUser) {
                  navigate(`/dashboard/${currentUser.user_type}`);
                } else {
                  navigate("/login");
                }
              }}
              className="bg-[#D2F57C] hover:bg-[#b8da64] text-xs font-mono font-bold py-2 border-2 border-[#141414] uppercase tracking-wider cursor-pointer"
            >
              Return to Legitimate Dashboard
            </button>

            <button
              onClick={async () => {
                setAuthToken("");
                setCurrentUser(null);
                setCurrentProfile(null);
                await fetch("/api/v1/auth/logout", {
                  method: "POST",
                  credentials: "include",
                });
                navigate("/login");
              }}
              className="bg-white hover:bg-neutral-50 text-xs font-mono font-bold py-2 border-2 border-[#141414] uppercase tracking-wider text-neutral-600 cursor-pointer"
            >
              Switch Accounts / Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[1024px] h-[768px] bg-[#E4E3E0] text-[#141414] font-sans overflow-hidden flex flex-col border-[8px] border-[#141414] mx-auto relative shadow-2xl">
      {/* HEADER SECTION (48px h) */}
      <header className="h-12 border-b border-[#141414] flex items-center justify-between px-4 bg-white shrink-0 z-20">
        <div className="flex items-center gap-6">
          <span className="font-extrabold tracking-tighter text-lg bg-[#141414] text-white px-2 py-0.5 border border-[#141414]">
            FLATMATCH // PRO
          </span>
          <nav className="flex gap-4 text-[11.5px] uppercase font-serif italic tracking-wider">
            {currentUser?.user_type === "seeker" && (
              <>
                <button
                  onClick={() => setActiveTab("discovery")}
                  className={`pb-1 px-1 border-b-2 transition-all cursor-pointer ${activeTab === "discovery" ? "border-[#141414] font-bold text-[#141414] opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  Live Discovery
                </button>
                <button
                  onClick={() => setActiveTab("matrix")}
                  className={`pb-1 px-1 border-b-2 transition-all cursor-pointer ${activeTab === "matrix" ? "border-[#141414] font-bold text-[#141414] opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  Compatibility Matrix
                </button>
                <button
                  onClick={() => setActiveTab("messages")}
                  className={`pb-1 px-1 border-b-2 transition-all cursor-pointer relative ${activeTab === "messages" ? "border-[#141414] font-bold text-[#141414] opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  Messages
                  <span className="ml-1 bg-red-500 text-white text-[8px] font-mono rounded px-1 py-0.2">
                    12
                  </span>
                </button>
              </>
            )}
            {currentUser?.user_type === "tenant" && (
              <>
                <button
                  onClick={() => setActiveTab("matrix")}
                  className={`pb-1 px-1 border-b-2 transition-all cursor-pointer ${activeTab === "matrix" ? "border-[#141414] font-bold text-[#141414] opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  Flatmate Matching
                </button>
                <button
                  onClick={() => setActiveTab("messages")}
                  className={`pb-1 px-1 border-b-2 transition-all cursor-pointer relative ${activeTab === "messages" ? "border-[#141414] font-bold text-[#141414] opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  Messages
                  <span className="ml-1 bg-red-500 text-white text-[8px] font-mono rounded px-1 py-0.2">
                    12
                  </span>
                </button>
              </>
            )}
            {currentUser?.user_type === "owner" && (
              <button
                onClick={() => setActiveTab("owner_dashboard")}
                className={`pb-1 px-1 border-b-2 transition-all cursor-pointer ${activeTab === "owner_dashboard" ? "border-[#141414] font-bold text-[#141414] opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                Owner Bulk Hub
              </button>
            )}
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-1 px-1 border-b-2 transition-all cursor-pointer ${activeTab === "profile" ? "border-[#141414] font-bold text-[#141414] opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              My Preferences
            </button>
          </nav>
        </div>

        {/* LOGGED IN USER BADGE */}
        <div className="flex items-center gap-3 border-l border-[#141414] pl-4 h-full py-1">
          <div className="text-right">
            <div className="text-xs font-bold text-[#141414]">
              {currentUser?.full_name}
            </div>
            <div className="text-[9px] font-mono opacity-50 uppercase tracking-widest leading-none mt-0.5">
              {currentUser?.user_type}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full border border-[#141414] bg-[#D2F57C] text-xs font-mono font-bold flex items-center justify-center">
            {currentUser?.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase() || "U"}
          </div>
          <button
            onClick={async () => {
              try {
                await fetch("/api/v1/auth/logout", {
                  method: "POST",
                });
                setAuthToken("");
                setCurrentUser(null);
                setCurrentProfile(null);
                navigate("/login");
              } catch (e) {
                console.error("Logout failed", e);
              }
            }}
            className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 hover:text-red-650 cursor-pointer ml-2 border border-[#141414] px-1.5 py-1 bg-white hover:bg-neutral-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* DISCOVERY TAB VIEW */}
        {activeTab === "discovery" && currentUser?.user_type === "seeker" && (
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT SEARCH BAR SIDEBAR */}
            <aside className="w-[310px] border-r border-[#141414] flex flex-col bg-white shrink-0">
              {/* Active Geo Filters controls */}
              <div className="p-4 border-b border-[#141414] bg-[#F5F5F3]">
                <div className="flex justify-between items-end mb-2">
                  <h2 className="font-serif italic text-xs font-bold uppercase tracking-wide">
                    Discovery Filter
                  </h2>
                  <span className="text-[9px] font-mono opacity-50 bg-white border border-[#141414] px-1.5 py-0.5">
                    {listings.length} LISTINGS
                  </span>
                </div>

                {/* Active Zone Buttons */}
                <div className="mb-2">
                  <div className="text-[9px] font-mono mb-1 text-zinc-500 uppercase tracking-wider">
                    Regions & Metro Hubs
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { name: "Kochi", lat: 9.9312, lng: 76.2673 },
                      { name: "Trivandrum", lat: 8.5241, lng: 76.9366 },
                      { name: "Kozhikode", lat: 11.2588, lng: 75.7804 },
                      { name: "Thrissur", lat: 10.5276, lng: 76.2144 },
                      { name: "New York", lat: 40.7128, lng: -74.006 },
                    ].map((city) => {
                      const isSelected =
                        Math.abs(searchLat - city.lat) < 0.2 &&
                        Math.abs(searchLng - city.lng) < 0.2;
                      return (
                        <button
                          key={city.name}
                          type="button"
                          onClick={() => {
                            setSearchQuery(
                              city.name === "New York" ? "New York" : city.name,
                            );
                            setSearchLat(city.lat);
                            setSearchLng(city.lng);
                          }}
                          className={`text-[8.5px] px-1.5 py-0.5 border border-[#141414] font-mono font-bold leading-normal uppercase transition-all ${
                            isSelected
                              ? "bg-[#D2F57C] text-black"
                              : "bg-white hover:bg-zinc-100 text-zinc-800"
                          }`}
                        >
                          {city.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="relative mb-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Kochi, Trivandrum, Kozhikode..."
                    className="w-full border border-[#141414] text-xs p-2 pl-8 outline-none bg-white font-mono placeholder:opacity-50"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 opacity-60" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-3 text-xs opacity-60 hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  <div>
                    <div className="flex justify-between text-[9px] font-mono mb-1">
                      <span>Listing Type Filter</span>
                      <span className="font-bold uppercase tracking-wider">
                        {selectedListingType.replace("_", " ")}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => setSelectedListingType("all")}
                        className={`text-[9px] py-1 border border-[#141414] font-bold uppercase tracking-widest ${selectedListingType === "all" ? "bg-[#141414] text-white" : "bg-white text-[#141414]"}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setSelectedListingType("shared_stay")}
                        className={`text-[9px] py-1 border border-[#141414] font-bold uppercase tracking-widest ${selectedListingType === "shared_stay" ? "bg-[#141414] text-white" : "bg-white text-[#141414]"}`}
                      >
                        Share
                      </button>
                      <button
                        onClick={() => setSelectedListingType("entire_unit")}
                        className={`text-[9px] py-1 border border-[#141414] font-bold uppercase tracking-widest ${selectedListingType === "entire_unit" ? "bg-[#141414] text-white" : "bg-white text-[#141414]"}`}
                      >
                        Entire
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] font-mono mb-0.5">
                      <span>Max Price Range</span>
                      <span className="font-bold">
                        {formatPrice(maxPrice)}/mo
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5000"
                      max="100000"
                      step="1000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-[#141414] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] font-mono mb-0.5">
                      <span>Map Search Radius</span>
                      <span className="font-bold">{searchRadius} km</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="40"
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(Number(e.target.value))}
                      className="w-full accent-[#141414] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* LISTINGS STREAM CONTROLLER */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#141414]">
                {listings.length === 0 ? (
                  <div className="p-6 text-center text-xs opacity-60 font-mono italic">
                    No active properties found matching filters.
                    <br />
                    Try adjusting pricing limits or searching "Bengaluru".
                  </div>
                ) : (
                  listings.map((l, idx) => {
                    const isSelected = selectedListing?.id === l.id;
                    return (
                      <div
                        key={l.id}
                        onClick={() => setSelectedListing(l)}
                        className={`grid grid-cols-[36px_1fr_64px] border-b border-[#141414] p-3 cursor-pointer select-none transition-colors ${isSelected ? "bg-[#141414] text-white" : "bg-white text-[#141414] hover:bg-[#F5F5F3]"}`}
                      >
                        <div className="text-[10px] font-mono opacity-50 mt-0.5">
                          {(idx + 1).toString().padStart(2, "0")}
                        </div>
                        <div className="pr-1 overflow-hidden">
                          <div className="text-xs font-black leading-snug truncate flex items-center gap-1">
                            {l.is_verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0 inline" />
                            )}
                            <span className="truncate">{l.title}</span>
                          </div>
                          <div className="text-[9px] opacity-70 mt-0.5 font-mono truncate">
                            {l.address}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                            <span
                              className={`text-[7.5px] font-extrabold px-1.5 border leading-none py-0.5 tracking-tighter uppercase rounded-none ${
                                l.listing_type === "shared_stay"
                                  ? isSelected
                                    ? "bg-[#FFFBEB] text-[#78350F] border-[#FCD34D]"
                                    : "bg-amber-100 text-amber-900 border-amber-300"
                                  : isSelected
                                    ? "bg-[#EFF6FF] text-[#1E3A8A] border-[#93C5FD]"
                                    : "bg-blue-100 text-blue-900 border-blue-300"
                              }`}
                            >
                              {l.listing_type === "shared_stay"
                                ? "🤝 ROOMMATE MATCH"
                                : "🏢 LANDLORD UNIT"}
                            </span>
                            {l.room_size && (
                              <span className="text-[7.5px] font-mono opacity-85 underline decoration-dotted">
                                {l.room_size}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex flex-col justify-between items-end">
                          <div className="font-mono text-xs font-bold">
                            {formatPrice(l.price_per_month)}
                          </div>
                          <div className="text-[9px] font-mono bg-[#D2F57C] text-[#141414] font-bold px-1 border border-[#141414]">
                            {l.listing_type === "shared_stay" ? "92%" : "Unit"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-3 border-t border-[#141414] bg-[#F5F5F3] text-[9px] font-mono uppercase opacity-60 flex justify-between items-center">
                <span>Matching Engine Real-Time</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
              </div>
            </aside>

            {/* RIGHT SIDE MAIN SECTION - DETAIL + MAP GRID */}
            <main className="flex-1 flex flex-col overflow-y-auto p-4 gap-4">
              {selectedListing ? (
                <div
                  className="grid grid-cols-[1fr_310px] gap-4"
                  style={{ height: "100%", minHeight: "680px" }}
                >
                  {/* PROPERTY BULLETINS DETAIL PANEL */}
                  <div className="flex flex-col gap-4 overflow-y-auto">
                    <section className="border-2 border-[#141414] bg-white p-5 shadow-[4px_4px_0px_#141414] flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h1 className="text-xl font-black uppercase tracking-tight leading-dense flex flex-wrap items-center gap-1.5">
                            {selectedListing.title}
                            {selectedListing.is_verified && (
                              <span className="inline-flex items-center gap-1 bg-[#D2F57C] text-black border border-[#141414] px-1.5 py-0.5 text-[8.5px] font-extrabold tracking-wider uppercase shrink-0 shadow-[1px_1px_0px_#141414] animate-pulse">
                                <ShieldCheck className="w-3.5 h-3.5 text-green-700" />{" "}
                                Verified Stay
                              </span>
                            )}
                          </h1>
                          <div className="px-2 py-0.5 bg-[#141414] text-white text-[9px] font-mono uppercase border border-[#141414] font-bold shrink-0">
                            {selectedListing.listing_type === "shared_stay"
                              ? "Shared Stay"
                              : "Entire Unit"}
                          </div>
                        </div>

                        <p className="text-[10.5px] font-serif text-stone-700 italic border-l-2 border-[#141414] pl-3 py-1 mb-4">
                          "{selectedListing.description}"
                        </p>

                        <div className="grid grid-cols-2 gap-4 border-t border-[#141414] pt-3">
                          <div className="space-y-2">
                            <div>
                              <div className="text-[8.5px] font-bold uppercase opacity-50 mb-0.5 tracking-wider font-mono">
                                Location Coordinates
                              </div>
                              <div className="text-xs font-bold flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                <span className="truncate">
                                  {selectedListing.address}
                                </span>
                              </div>
                            </div>

                            {selectedListing.listing_type === "shared_stay" ? (
                              <>
                                <div>
                                  <div className="text-[8.5px] font-bold uppercase opacity-50 mb-0.5 tracking-wider font-mono">
                                    Private Room Metrics
                                  </div>
                                  <div className="text-xs font-mono font-bold bg-[#F5F5F3] px-2 py-0.5 border border-[#141414] inline-block">
                                    {selectedListing.room_size ||
                                      "12' x 14' Size"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[8.5px] font-bold uppercase opacity-50 mb-0.5 tracking-wider font-mono">
                                    Utilities splitting rules
                                  </div>
                                  <div className="text-xs font-mono">
                                    {selectedListing.utility_split ||
                                      "Equally split between roommates (~$65)"}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <div className="text-[8.5px] font-bold uppercase opacity-50 mb-0.5 tracking-wider font-mono">
                                    Apartment Type
                                  </div>
                                  <div className="text-xs font-bold">
                                    {selectedListing.apartment_type ||
                                      "Studio Flat"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[8.5px] font-bold uppercase opacity-50 mb-0.5 tracking-wider font-mono">
                                    Lease Security Deposit
                                  </div>
                                  <div className="text-xs font-bold text-red-700">
                                    {formatPrice(selectedListing.deposit)}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div>
                              <div className="text-[8.5px] font-bold uppercase opacity-50 mb-0.5 tracking-wider font-mono font-black">
                                Monthly Pricing
                              </div>
                              <div className="text-lg font-mono font-black text-green-700 leading-none">
                                {formatPrice(selectedListing.price_per_month)}
                                <span className="text-[10px] font-bold ml-1 text-black">
                                  /month
                                </span>
                              </div>
                            </div>

                            <div>
                              <div className="text-[8.5px] font-bold uppercase opacity-50 mb-0.5 tracking-wider font-mono">
                                Listing Host / Owner
                              </div>
                              <div className="text-xs font-black">
                                {selectedListing.owner_name ||
                                  "Marcus Sterling Properties"}
                              </div>
                            </div>

                            <div>
                              <div className="text-[8.5px] font-bold uppercase opacity-50 mb-0.5 tracking-wider font-mono">
                                Included Amenities
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedListing.amenities.map((a, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 bg-[#D2F57C] text-[#141414] text-[8px] font-black border border-[#141414] uppercase leading-none"
                                  >
                                    {a}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <div className="text-[8.5px] font-bold uppercase opacity-50 mb-1 tracking-wider font-mono text-red-700 font-extrabold">
                                Roommate Gender Preference
                              </div>
                              <div className="text-xs font-bold font-mono text-red-950 bg-red-50/70 border-2 border-red-400 px-2.5 py-1 inline-block uppercase tracking-tight">
                                🚻{" "}
                                {selectedListing.gender_preference ||
                                  "No preference"}
                              </div>
                            </div>

                            <div>
                              <div className="text-[8.5px] font-bold uppercase opacity-50 mb-1 tracking-wider font-mono text-red-700 font-extrabold">
                                Mandatory House Rules
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {(
                                  selectedListing.house_restrictions || [
                                    "No smoking indoors",
                                    "Respect quiet hours",
                                    "No commercial parties",
                                  ]
                                ).map((r, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-red-50 text-red-900 border border-red-300 text-[8px] font-black uppercase leading-none rounded-none flex items-center gap-1 shadow-[1px_1px_0px_#ef4444]"
                                  >
                                    ⛔ {r}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* QUICK ACTION ROW BOX */}
                      <div className="mt-4 pt-3 border-t border-dashed border-zinc-400 flex flex-wrap justify-between items-center gap-2">
                        {currentUser?.id !== selectedListing.owner_id ? (
                          <>
                            <button
                              onClick={() =>
                                handleInitiateChat(selectedListing.owner_id)
                              }
                              className="flex-1 bg-[#141414] text-white py-2 px-3 text-[10px] font-black uppercase tracking-widest border border-[#141414] hover:bg-neutral-800 transition-all text-center flex items-center justify-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:translate-y-[-1px] cursor-pointer min-w-[140px]"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Contact Owner
                            </button>
                            <button
                              onClick={() => {
                                setSchedulingListing(selectedListing);
                                setViewingNotes("");
                                setViewingDate("2026-06-25");
                                setViewingTime("14:00");
                                setShowScheduleModal(true);
                              }}
                              className="flex-1 bg-[#D2F57C] text-[#141414] py-2 px-3 text-[10px] font-black uppercase tracking-widest border border-[#141414] hover:bg-[#c2e46cf3] transition-all text-center flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#141414] hover:translate-y-[-1px] cursor-pointer min-w-[130px]"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              Propose Viewing
                            </button>
                            <button
                              onClick={() => {
                                alert(
                                  `Simulating Application Request registered for host: ${selectedListing.owner_name}. Verification is now waiting on tenant response.`,
                                );
                              }}
                              className="px-3 py-2 border border-[#141414] bg-white hover:bg-[#F5F5F3] font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_#141414] active:shadow-none translate-y-0 active:translate-y-[2px]"
                            >
                              Apply
                            </button>
                          </>
                        ) : (
                          <div className="flex justify-between w-full items-center">
                            <span className="text-[10px] font-mono text-zinc-500">
                              This is your property listing.
                            </span>
                            <button
                              onClick={() =>
                                handleDeleteListing(selectedListing.id)
                              }
                              className="bg-red-500 text-white border border-[#141414] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-red-650"
                            >
                              <Trash2 className="w-3" />
                              Remove Listing
                            </button>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* PHOTO PORTFOLIOS GALLERY METRIC */}
                    <section className="border-2 border-[#141414] bg-white p-3 shadow-[4px_4px_0px_#141414] flex-1 flex flex-col justify-between">
                      <div className="text-[10px] font-mono uppercase opacity-50 mb-2">
                        Unit Imagery Media (Max 10 High-res Uploads)
                      </div>
                      <div className="grid grid-cols-2 gap-2 h-[210px]">
                        {selectedListing.image_urls &&
                        selectedListing.image_urls.length > 0 ? (
                          selectedListing.image_urls.map((img, i) => (
                            <div
                              key={i}
                              className="border border-[#141414] overflow-hidden relative group bg-neutral-100"
                            >
                              <img
                                src={img}
                                alt={`${selectedListing.title} scene ${i}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 border border-dashed border-[#141414] flex flex-col items-center justify-center text-zinc-500 text-xs">
                            No property images uploaded yet.
                          </div>
                        )}
                        {/* Fallback box if only 1 image */}
                        {selectedListing.image_urls &&
                          selectedListing.image_urls.length === 1 && (
                            <div className="border border-dashed border-[#141414] flex flex-col items-center justify-center text-zinc-500 bg-[#F5F5F3] p-4 text-center">
                              <Upload className="w-5 h-5 mb-1 opacity-50" />
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                                Drag & drop photos
                              </span>
                              <span className="text-[8px] opacity-60">
                                to fill slot vacancy
                              </span>
                            </div>
                          )}
                      </div>
                    </section>
                  </div>

                  {/* HIGH CONTRAST GEO RADIUS SIMULATED MAP */}
                  <div className="flex flex-col gap-4">
                    <section className="border-2 border-[#141414] bg-white p-4 shadow-[4px_4px_0px_#141414] flex-1 flex flex-col relative h-[380px] overflow-hidden">
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-white border border-[#141414] text-[9px] font-mono font-bold uppercase shadow-sm">
                        Geographic Search Plot Matrix
                      </div>

                      {/* Map backdrop mock canvas */}
                      <div className="flex-1 bg-[#EEEDE9] relative border border-[#141414] overflow-hidden">
                        <div
                          className="absolute inset-0 opacity-[0.06] pointer-events-none"
                          style={{
                            backgroundImage:
                              "radial-gradient(#141414 1.5px, transparent 1.5px)",
                            backgroundSize: "16px 16px",
                          }}
                        ></div>

                        {/* Fake roads and subway lines cross */}
                        <div className="absolute top-[40%] left-0 w-full h-[6px] bg-[#141414] opacity-[0.07] rotate-6"></div>
                        <div className="absolute top-0 right-[35%] w-[8px] h-full bg-[#141414] opacity-[0.07] -rotate-12"></div>
                        <div className="absolute top-[70%] left-0 w-full h-[4px] bg-[#141414] opacity-[0.04]"></div>

                        {/* Interactive Radius Ring Circle representing filter limits set */}
                        <div
                          className="absolute border border-[#141414]/30 border-dashed rounded-full pointer-events-none flex items-center justify-center bg-zinc-300/10 transition-all duration-300"
                          style={{
                            width: "81%",
                            height: "81%",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          <span className="text-[8px] font-mono opacity-50 uppercase absolute bottom-2">
                            Radius Limit ({searchRadius} km)
                          </span>
                        </div>

                        {/* Search Focus Center Crosshair */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 pointer-events-none">
                          <div className="w-5 h-5 border border-[#141414] rounded-full ring-2 ring-white"></div>
                          <div className="w-1.5 h-1.5 bg-[#141414] rounded-full absolute"></div>
                        </div>

                        {/* Property Pins Plotting */}
                        {listings.map((l) => {
                          // Dynamically scale coordinates relative to radius to prevent overflow clipping
                          const scaleFactor = 4500 / (searchRadius || 25);
                          const dLat = (l.latitude - searchLat) * scaleFactor;
                          // Adjust longitude by cosine of latitude to keep scale projection accurate
                          const cosLat = Math.cos((searchLat * Math.PI) / 180);
                          const dLng =
                            (l.longitude - searchLng) * scaleFactor * cosLat;
                          const topPct = 50 - dLat;
                          const leftPct = 50 + dLng;

                          const isCurrent = selectedListing?.id === l.id;

                          return (
                            <button
                              key={l.id}
                              onClick={() => handleMapPinSelect(l)}
                              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all p-1 outline-none ${isCurrent ? "z-20 scale-125" : "hover:scale-110 z-10"}`}
                              style={{
                                top: `${Math.max(8, Math.min(92, topPct))}%`,
                                left: `${Math.max(8, Math.min(92, leftPct))}%`,
                              }}
                              title={l.title}
                            >
                              <div className="relative flex flex-col items-center">
                                <div
                                  className={`font-mono text-[8px] py-0.5 px-1 font-bold ${isCurrent ? "bg-[#141414] text-white border border-[#141414]" : "bg-white text-zinc-800 border border-[#141414]"} leading-none rounded-sm mb-0.5 whitespace-nowrap shadow-sm`}
                                >
                                  {formatPrice(l.price_per_month)}
                                </div>
                                <div
                                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${isCurrent ? "bg-[#D2F57C] border-[#141414] animate-pulse ring-4 ring-[#D2F57C]/40" : "bg-white border-[#141414]"}`}
                                >
                                  <div className="w-1.5 h-1.5 bg-[#141414] rounded-full"></div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-2 text-right">
                        <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest text-zinc-500">
                          Interactive Simulated Map Coordinates
                        </span>
                      </div>
                    </section>

                    {/* ACCREDITED VERIFICATION LOGS SCREEN FOR ROOM SEEKER */}
                    <section className="border-2 border-[#141414] bg-white p-3.5 shadow-[4px_4px_0px_#141414] h-[200px] flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center pb-1.5 border-b border-[#141414]">
                          <span className="text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1 text-[#141414]">
                            <Shield className="w-3.5 h-3.5 text-green-600" />
                            FlatMatch Credentials Verification
                          </span>
                        </div>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-start gap-2">
                            {currentUser?.is_verified ? (
                              <Check className="w-4 h-4 text-green-600 bg-green-100 border border-green-500 p-0.5 shrink-0" />
                            ) : (
                              <BadgeAlert className="w-4 h-4 text-orange-600 bg-orange-100 border border-orange-500 p-0.5 shrink-0" />
                            )}
                            <div>
                              <div className="text-[10px] font-bold">
                                KYC Identity Check:{" "}
                                {currentUser?.is_verified
                                  ? "Approved & Sealed"
                                  : "Pending Verification"}
                              </div>
                              <p className="text-[9px] opacity-60">
                                Verified government issued Aadhaar or PAN card
                                seals trust across FlatMatch India.
                              </p>
                              {!currentUser?.is_verified && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVerifyingListingId("seeker_profile");
                                    setDocType("Aadhaar");
                                    setLicenseNum("");
                                    setShowVerifyModal(true);
                                  }}
                                  className="mt-1.5 px-1.5 py-0.5 border border-[#141414] bg-[#D2F57C] hover:bg-lime-400 text-black font-mono font-bold text-[8px] uppercase tracking-wide cursor-pointer"
                                >
                                  Submit Aadhaar / PAN KYC
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 bg-green-100 border border-green-500 p-0.5 shrink-0" />
                            <div>
                              <div className="text-[10px] font-bold">
                                In-App Chat Protection: Enabled
                              </div>
                              <p className="text-[9px] opacity-60">
                                Personal emails and private mobile details are
                                securely hidden inside our WebSocket server.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#F5F5F3] p-1.5 border border-[#141414] text-[9px] font-mono flex justify-between items-center">
                        <span className="font-bold">
                          Subscription Access Tier:
                        </span>
                        <span className="px-1.5 py-0.2 bg-[#141414] text-[#D2F57C] font-black text-[8px] uppercase">
                          {currentUser?.tier?.replace("_", " ") || "Free Tier"}
                        </span>
                      </div>
                    </section>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#141414] bg-white p-12 text-center my-auto flex flex-col items-center justify-center">
                  <SlidersHorizontal className="w-8 h-8 mb-2 opacity-50" />
                  <div className="text-sm font-bold uppercase tracking-wider mb-1">
                    No Listing Selected
                  </div>
                  <p className="text-xs opacity-60 max-w-sm">
                    Toggle discovery preferences on side panel index to query
                    available stays currently available across FlatMatch.
                  </p>
                </div>
              )}
            </main>
          </div>
        )}

        {/* COMPATIBILITY MATRIX TAB VIEW */}
        {activeTab === "matrix" &&
          (currentUser?.user_type === "seeker" ||
            currentUser?.user_type === "tenant") && (
            <div className="flex-1 flex overflow-hidden">
              {/* LIFESTYLE LIST OF COOPERATIVES */}
              <aside className="w-[300px] border-r border-[#141414] flex flex-col bg-white shrink-0">
                <div className="p-4 border-b border-[#141414] bg-[#F5F5F3]">
                  <h2 className="font-serif italic text-xs font-bold uppercase tracking-wide mb-1">
                    Roomie Match Partners
                  </h2>
                  <p className="text-[9px] font-mono opacity-50 uppercase">
                    Ranked by compatibility scoring matrix
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-[#141414]">
                  {matches.length === 0 ? (
                    <div className="p-6 text-center text-xs opacity-60 font-mono italic">
                      No matching profiles found.
                      <br />
                      Ensure your user profile simulation matches seekers with
                      tenants. Change role in header above.
                    </div>
                  ) : (
                    matches.map((m, idx) => {
                      const isSelected = selectedMatch?.user?.id === m.user.id;
                      return (
                        <div
                          key={m.user.id}
                          onClick={() => {
                            setSelectedMatch(m);
                            if (currentUser) {
                              triggerAiConsultation(currentUser.id, m.user.id);
                            }
                          }}
                          className={`p-3.5 cursor-pointer flex flex-col justify-between transition-colors ${isSelected ? "bg-[#141414] text-white" : "bg-white text-[#141414] hover:bg-[#F5F5F3]"}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <div className="text-xs font-black leading-tight">
                                {m.user.full_name}
                              </div>
                              <div className="text-[9px] opacity-75 font-mono">
                                {m.profile.profession} // Age {m.profile.age}
                              </div>
                            </div>
                            <div
                              className={`font-mono text-sm font-black px-1.5 py-0.5 border ${isSelected ? "bg-[#D2F57C] text-[#141414] border-[#D2F57C]" : "bg-[#141414] text-[#D2F57C] border-[#111]"}`}
                            >
                              {m.score}%
                            </div>
                          </div>

                          {/* Thumbnail details tags */}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            <span
                              className={`text-[8px] font-mono px-1 border uppercase ${isSelected ? "border-zinc-500" : "border-zinc-300 bg-zinc-50"}`}
                            >
                              {m.profile.smoker ? "Smokes" : "No Smoke"}
                            </span>
                            <span
                              className={`text-[8px] font-mono px-1 border uppercase ${isSelected ? "border-zinc-500" : "border-zinc-300 bg-zinc-50"}`}
                            >
                              {m.profile.pets_allowed ? "Pets OK" : "No Pets"}
                            </span>
                            <span
                              className={`text-[8px] font-mono px-1 border uppercase ${isSelected ? "border-zinc-500" : "border-zinc-300 bg-zinc-50"}`}
                            >
                              Clean: {m.profile.cleanliness_level}/5
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-3.5 border-t border-[#141414] bg-[#F5F5F3] text-[9px] font-mono opacity-50 uppercase">
                  Matching seeker matrix to host list
                </div>
              </aside>

              {/* MATRIX COMPARATIVE VISUAL WORKBENCH */}
              <main className="flex-1 overflow-y-auto p-5 bg-[#E4E3E0] flex flex-col gap-4">
                {selectedMatch ? (
                  <div className="grid grid-cols-[1fr_320px] gap-4">
                    {/* COMPARATIVE VALUES RADIAL CHART PANELS */}
                    <div className="flex flex-col gap-4">
                      {/* PROFILE STATEMENTS COLLATERAL */}
                      <section className="border-2 border-[#141414] bg-white p-5 shadow-[4px_4px_0px_#141414]">
                        <div className="flex justify-between items-start mb-4 pb-2 border-b border-[#141414]">
                          <div>
                            <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest leading-none mb-1">
                              Direct Match Insight
                            </div>
                            <h2 className="text-lg font-black tracking-tight">
                              {currentUser?.full_name} ⇆{" "}
                              {selectedMatch.user.full_name}
                            </h2>
                          </div>
                          <span className="text-3xl font-mono font-black text-[#141414] bg-[#D2F57C] border border-[#141414] px-3 py-1">
                            {selectedMatch.score}%
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 border border-[#141414] bg-[#F5F5F3]">
                            <div className="text-[9px] font-mono opacity-60 uppercase mb-1 font-bold">
                              Your Preference Profile
                            </div>
                            <div className="space-y-1 text-xs">
                              <div>
                                <span className="opacity-50">
                                  Tidiness Level:
                                </span>{" "}
                                <strong>
                                  {currentProfile?.cleanliness_level}/5
                                </strong>
                              </div>
                              <div>
                                <span className="opacity-50">Pet Policy:</span>{" "}
                                <strong>
                                  {currentProfile?.pets_allowed
                                    ? "Allowed"
                                    : "Prohibited"}
                                </strong>
                              </div>
                              <div>
                                <span className="opacity-50">Smoking:</span>{" "}
                                <strong>
                                  {currentProfile?.smoker
                                    ? "Smokes"
                                    : "No smoke"}
                                </strong>
                              </div>
                              <div>
                                <span className="opacity-50">
                                  Budget Limit:
                                </span>{" "}
                                <strong>
                                  {currentProfile
                                    ? `${formatPrice(currentProfile.budget_min)} - ${formatPrice(currentProfile.budget_max)}`
                                    : ""}
                                </strong>
                              </div>
                              <div>
                                <span className="opacity-50">
                                  Workspace Status:
                                </span>{" "}
                                <strong className="uppercase">
                                  {currentProfile?.wfh_status}
                                </strong>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 border border-[#141414] bg-[#D2F57C]/10 flex flex-col justify-between">
                            <div>
                              <div className="text-[9px] font-mono text-[#141414]/70 uppercase mb-1 font-bold">
                                Their Preference Profile
                              </div>
                              <div className="space-y-1 text-xs">
                                <div>
                                  <span className="opacity-50">
                                    Tidiness Level:
                                  </span>{" "}
                                  <strong>
                                    {selectedMatch.profile.cleanliness_level}/5
                                  </strong>
                                </div>
                                <div>
                                  <span className="opacity-50">
                                    Pet Policy:
                                  </span>{" "}
                                  <strong>
                                    {selectedMatch.profile.pets_allowed
                                      ? "Allowed"
                                      : "Prohibited"}
                                  </strong>
                                </div>
                                <div>
                                  <span className="opacity-50">Smoking:</span>{" "}
                                  <strong>
                                    {selectedMatch.profile.smoker
                                      ? "Smokes"
                                      : "No smoke"}
                                  </strong>
                                </div>
                                <div>
                                  <span className="opacity-50">
                                    Budget Limit:
                                  </span>{" "}
                                  <strong>{`${formatPrice(selectedMatch.profile.budget_min)} - ${formatPrice(selectedMatch.profile.budget_max)}`}</strong>
                                </div>
                                <div>
                                  <span className="opacity-50">
                                    Workspace Status:
                                  </span>{" "}
                                  <strong className="uppercase">
                                    {selectedMatch.profile.wfh_status}
                                  </strong>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleAdoptPreferences(selectedMatch.profile)
                              }
                              className="mt-3 w-full bg-[#141414] text-white hover:bg-neutral-800 text-[9px] font-mono uppercase tracking-wider py-1.5 border border-[#141414] cursor-pointer text-center font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.2)] hover:translate-y-[-0.5px] transition-all"
                            >
                              Adopt Preferences
                            </button>
                          </div>
                        </div>

                        {/* BIO BLOCK NOTES */}
                        <div className="mt-4 p-3.5 border border-[#141414] bg-white">
                          <div className="text-[9px] font-mono uppercase opacity-50 mb-1">
                            Partner Personal Statement // Biography
                          </div>
                          <p className="text-xs font-serif leading-relaxed italic text-zinc-700">
                            "
                            {selectedMatch.profile.bio ||
                              "No custom greeting bio updated on FlatMatch profile listings."}
                            "
                          </p>
                        </div>

                        {/* QUICK DESTRUCT CHAT CALL */}
                        <button
                          onClick={() =>
                            handleInitiateChat(selectedMatch.user.id)
                          }
                          className="w-full mt-4 bg-[#141414] text-white py-2.5 text-[10px] font-bold uppercase tracking-widest border border-[#141414] hover:bg-[#252525] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#141414]"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Initiate Compatibility Discussion Now
                        </button>
                      </section>

                      {/* FACTOR SUMMARY LISTINGS */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* POSITIVES ACCREDITED */}
                        <section className="border-2 border-[#141414] bg-white p-4 shadow-[4px_4px_0px_#141414]">
                          <div className="text-[9px] font-mono text-green-700 uppercase mb-2 font-black tracking-widest">
                            👍 Co-op Alignment Anchors
                          </div>
                          <ul className="space-y-1.5">
                            {selectedMatch.matchFactors.map(
                              (f: string, i: number) => (
                                <li
                                  key={i}
                                  className="text-xs flex items-start gap-1.5 font-bold"
                                >
                                  <span className="text-green-600 font-mono">
                                    ✔
                                  </span>
                                  <span className="text-stone-700">{f}</span>
                                </li>
                              ),
                            )}
                            {selectedMatch.matchFactors.length === 0 && (
                              <li className="text-[11px] opacity-60 italic font-mono">
                                No direct alignment filters catalogued.
                              </li>
                            )}
                          </ul>
                        </section>

                        {/* CONTRAST NEGATIVE GAPS */}
                        <section className="border-2 border-[#141414] bg-white p-4 shadow-[4px_4px_0px_#141414]">
                          <div className="text-[9px] font-mono text-orange-700 uppercase mb-2 font-black tracking-widest">
                            ⚖️ Divergence Adaptation Gaps
                          </div>
                          <ul className="space-y-1.5">
                            {selectedMatch.mismatchFactors.map(
                              (f: string, i: number) => (
                                <li
                                  key={i}
                                  className="text-xs flex items-start gap-1.5 font-bold text-stone-850"
                                >
                                  <span className="text-orange-500 font-mono">
                                    ❗
                                  </span>
                                  <span>{f}</span>
                                </li>
                              ),
                            )}
                            {selectedMatch.mismatchFactors.length === 0 && (
                              <li className="text-xs text-green-600 font-bold flex items-center gap-1.5">
                                <span>🎉</span>
                                <span>Zero frictional conflicts computed!</span>
                              </li>
                            )}
                          </ul>
                        </section>
                      </div>
                    </div>

                    {/* AI POWERED COMPATIBILITY REVIEWS SCREEN CARD */}
                    <div className="flex flex-col gap-4">
                      <section className="border-2 border-[#141414] bg-white p-4.5 shadow-[4px_4px_0px_#141414] flex-1 flex flex-col justify-between min-h-[350px]">
                        <div>
                          <div className="flex justify-between items-center pb-2 border-b border-[#141414] mb-3">
                            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              Gemini AI Analytical Breakdown
                            </span>
                            <span className="text-[8px] bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase px-1 py-0.2 font-mono">
                              3.5 Flash Model
                            </span>
                          </div>

                          {loadingAi ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                              <span className="text-[11px] font-mono font-bold uppercase tracking-widest">
                                Consulting Gemini...
                              </span>
                            </div>
                          ) : aiBreakdown ? (
                            <div className="text-[11px] leading-relaxed text-zinc-800 space-y-2 max-h-[360px] overflow-y-auto pr-1">
                              {/* Format paragraphs cleanly */}
                              {aiBreakdown.aiAnalysis
                                .split("\n\n")
                                .map((para, idx) => {
                                  if (para.startsWith("###")) {
                                    return (
                                      <h4
                                        key={idx}
                                        className="font-extrabold uppercase text-[10px] tracking-wider text-indigo-950 mt-2"
                                      >
                                        {para.replace("###", "").trim()}
                                      </h4>
                                    );
                                  }
                                  if (para.startsWith("*")) {
                                    return (
                                      <ul
                                        key={idx}
                                        className="list-disc pl-4 space-y-1 text-[10.5px]"
                                      >
                                        {para.split("\n").map((li, lidx) => (
                                          <li key={lidx}>
                                            {li.replace(/^\*+\s*/, "").trim()}
                                          </li>
                                        ))}
                                      </ul>
                                    );
                                  }
                                  return (
                                    <p
                                      key={idx}
                                      className="font-serif italic text-stone-700"
                                    >
                                      {para}
                                    </p>
                                  );
                                })}
                            </div>
                          ) : (
                            <div className="text-center py-12 opacity-60 text-xs italic font-mono">
                              Ensure a valid GEMINI_API_KEY is configured in
                              your secrets page.
                            </div>
                          )}
                        </div>

                        <div className="bg-amber-50 p-2.5 border border-amber-400 mt-4 rounded-none text-[8.5px] font-serif leading-snug">
                          💡 <strong>Simulation Tips:</strong> Try switching
                          profiles from alex to dave in the header drop-down to
                          see custom compatibility scoring and real-time AI
                          roommate reports with different lifestyle matches.
                        </div>
                      </section>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#141414] bg-white p-12 text-center my-auto">
                    Select a flatmate partner from list stream to run
                    algorithmic compatibility review.
                  </div>
                )}
              </main>
            </div>
          )}

        {/* IN-APP MESSAGES CHAT SCREEN */}
        {activeTab === "messages" &&
          (currentUser?.user_type === "seeker" ||
            currentUser?.user_type === "tenant") && (
            <div className="flex-1 flex overflow-hidden">
              {/* ACTIVE CONVERSATION AND SCHEDULE CONDUITS */}
              <aside className="w-[280px] border-r border-[#141414] flex flex-col bg-white shrink-0 overflow-y-auto">
                {/* SECTION A: CHATS */}
                <div className="p-3 border-b border-[#141414] bg-[#F5F5F3] flex justify-between items-center text-xs font-black uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#141414]" />{" "}
                    Dialogues Inbox
                  </span>
                  <span className="text-[10px] bg-[#141414] text-white px-1.5 py-0.2 font-mono">
                    {conversations.length}
                  </span>
                </div>

                <div className="max-h-[220px] overflow-y-auto divide-y divide-[#141414] border-b border-[#141414]">
                  {conversations.length === 0 ? (
                    <div className="p-4 text-center text-[10px] opacity-60 font-mono italic">
                      No active dialogue threads.
                    </div>
                  ) : (
                    conversations.map((c) => {
                      const isSelected =
                        activeConversation?.participant?.id ===
                        c.participant.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            handleSelectConversation(c);
                            setSelectedScheduleIdForView(null);
                          }}
                          className={`p-2.5 cursor-pointer flex flex-col justify-between transition-all ${isSelected ? "bg-[#141414] text-white" : "bg-white text-[#141414] hover:bg-[#F5F5F3]"}`}
                        >
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[11px] font-black truncate pr-1">
                              {c.participant.full_name}
                            </span>
                            <span className="text-[7.5px] font-mono opacity-50 shrink-0 uppercase">
                              {c.participant.user_type}
                            </span>
                          </div>
                          {c.lastMessage && (
                            <p className="text-[9.5px] opacity-75 truncate">
                              {c.lastMessage.message_text}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* SECTION B: SCHEDULES */}
                <div className="p-3 border-b border-[#141414] bg-[#F5F5F3] flex justify-between items-center text-xs font-black uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-700" /> Viewing
                    Tours
                  </span>
                  <span className="text-[10px] bg-indigo-700 text-white px-1.5 py-0.2 font-mono">
                    {allSchedules.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-[#141414]">
                  {allSchedules.length === 0 ? (
                    <div className="p-6 text-center text-[10px] opacity-60 font-mono italic">
                      No space tours scheduled.
                      <br />
                      Propose an alternate hour in listings today.
                    </div>
                  ) : (
                    allSchedules.map((s) => {
                      const isSelected = selectedScheduleIdForView === s.id;
                      const bTime = new Date(s.proposed_time);

                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedScheduleIdForView(s.id);
                            setActiveConversation(null);
                          }}
                          className={`p-2.5 cursor-pointer flex flex-col gap-1 transition-all ${isSelected ? "bg-indigo-950 text-white" : "bg-white text-[#141414] hover:bg-neutral-50"}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="text-[10.5px] font-black truncate max-w-[170px]">
                              {s.listing_title}
                            </div>
                            <span
                              className={`text-[7.5px] px-1 border uppercase font-mono shrink-0 ${
                                s.status === "accepted"
                                  ? "bg-[#D2F57C] text-black border-[#D2F57C]"
                                  : s.status === "declined"
                                    ? "bg-red-100 text-red-700 border-red-350"
                                    : "bg-amber-100 text-amber-700 border-amber-300"
                              }`}
                            >
                              {s.status === "accepted"
                                ? "Approved"
                                : s.status === "declined"
                                  ? "Declined"
                                  : "Proposed"}
                            </span>
                          </div>
                          <div className="text-[9.5px] font-mono opacity-80 flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />{" "}
                            {bTime.toLocaleDateString()}{" "}
                            {bTime.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-[8.5px] opacity-60 truncate">
                            With{" "}
                            {currentUser?.id === s.host_id
                              ? s.seeker_name
                              : s.host_name}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </aside>

              {/* CHAT THREAD OR SCHEDULE PANEL DETAIL WORKSPACE */}
              <main className="flex-1 flex flex-col bg-[#E4E3E0] p-4 min-w-0">
                {activeConversation && (
                  <div className="flex-1 border-2 border-[#141414] bg-white shadow-[4px_4px_0px_#141414] flex flex-col overflow-hidden">
                    {/* Active Header Partner info */}
                    <div className="p-3 border-b border-[#141414] bg-[#F5F5F3] flex justify-between items-center">
                      <div>
                        <div className="text-xs font-black">
                          {activeConversation.participant.full_name}
                        </div>
                        <div className="text-[9px] font-mono opacity-50 uppercase tracking-widest">
                          {activeConversation.participant.email} •{" "}
                          {activeConversation.participant.user_type} channel
                        </div>
                      </div>
                      {/* Mini avatar & Report action */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleShowReportUserModal(
                              activeConversation.participant,
                            )
                          }
                          className="bg-red-50 text-red-700 border border-red-400 px-2.5 py-1 text-[8.5px] font-black uppercase tracking-tight hover:bg-red-100 flex items-center gap-1 cursor-pointer transition-all active:translate-y-[1px]"
                        >
                          ⚠️ Report Dating Behavior
                        </button>
                        <div className="flex items-center gap-1 bg-[#D2F57C] border border-[#141414] text-[#141414] text-[9.5px] font-mono font-bold px-2 py-1">
                          ✓ SECURE
                        </div>
                      </div>
                    </div>

                    {/* Message body streams */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                      {/* Strict Community Platonic Policy Banner */}
                      <div className="p-3 bg-red-50 border-2 border-red-400 text-[10.5px] text-red-910 leading-normal flex gap-2.5 shadow-[2px_2px_0px_rgba(220,38,38,0.1)]">
                        <div className="text-base">🛡️</div>
                        <div>
                          <span className="font-extrabold uppercase text-[9px] font-mono tracking-wider block mb-0.5 text-red-800">
                            FlatMatch Platonic Guarantee Policy:
                          </span>
                          This is strictly a housing, rent-share, and roommate
                          matching network. **FlatMatch strictly forbids any
                          romantic solicitation, flirting, or pickup lines.**
                          Dating behavior will result in severe penalty and
                          permanent blacklisting. Press{" "}
                          <strong className="font-black text-red-950">
                            "⚠️ Report Dating Behavior"
                          </strong>{" "}
                          above to flag inappropriate conversations instantly.
                        </div>
                      </div>
                      {chatMessages.length === 0 ? (
                        <div className="p-6 text-center text-xs text-zinc-500 font-mono italic">
                          No previous dialogue recorded. Write an introductory
                          greeting below.
                        </div>
                      ) : (
                        chatMessages.map((m) => {
                          const isMe = m.sender_id === currentUser?.id;
                          return (
                            <div
                              key={m.id}
                              className={`flex gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                            >
                              {!isMe && (
                                <div className="w-6 h-6 bg-[#141414] border border-[#141414] shrink-0 text-white font-mono text-[10px] flex items-center justify-center">
                                  {activeConversation.participant.full_name[0]}
                                </div>
                              )}
                              <div className="max-w-[70%] text-wrap break-all">
                                <div
                                  className={`p-3.5 text-xs border border-[#141414] relative whitespace-pre-wrap ${isMe ? "bg-[#D2F57C] text-[#141414]" : "bg-[#F5F5F3] text-[#141414]"}`}
                                >
                                  {m.message_text}
                                  {m.media_url && (
                                    <div className="mt-2 border border-[#141414] max-h-40 overflow-hidden bg-white">
                                      <img
                                        src={m.media_url}
                                        alt="Shared document or property preview"
                                        className="w-full object-contain"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  )}
                                </div>
                                <div
                                  className={`text-[8px] font-mono opacity-50 mt-1 ${isMe ? "text-right" : "text-left"}`}
                                >
                                  {new Date(m.sent_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Message text enter input form */}
                    <form
                      onSubmit={handleSendMessage}
                      className="p-3 border-t border-[#141414] bg-white flex gap-2"
                    >
                      <div className="flex-1 relative flex flex-col gap-1">
                        <input
                          type="text"
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          placeholder={`Say something friendly to ${activeConversation.participant.full_name}...`}
                          className="w-full border border-[#141414] p-2.5 text-xs bg-transparent outline-none font-mono"
                        />

                        {/* Optional inline image uploader simulator for document attachments */}
                        <div className="flex gap-1.5 items-center">
                          <span className="text-[8.5px] font-mono text-zinc-500 uppercase font-bold">
                            Attach image:
                          </span>
                          <input
                            type="text"
                            placeholder="Image/KYC Doc URL (optional)"
                            value={attachedMediaUrl}
                            onChange={(e) =>
                              setAttachedMediaUrl(e.target.value)
                            }
                            className="text-[9px] px-1 bg-neutral-100 border border-[#141414] outline-none w-48 font-mono"
                          />
                          {attachedMediaUrl && (
                            <button
                              type="button"
                              onClick={() => setAttachedMediaUrl("")}
                              className="text-red-500 text-[9px] font-bold"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={!newMessageText.trim()}
                        className="bg-[#141414] text-white hover:bg-neutral-800 disabled:opacity-40 px-6 text-[10px] font-bold uppercase tracking-widest border border-[#141414] cursor-pointer"
                      >
                        Send Message
                      </button>
                    </form>
                  </div>
                )}

                {selectedScheduleIdForView &&
                  (() => {
                    const booking = allSchedules.find(
                      (as) => as.id === selectedScheduleIdForView,
                    );
                    if (!booking)
                      return (
                        <div className="p-6 bg-white border-2 border-[#141414]">
                          Viewing schedule not found.
                        </div>
                      );
                    const isHost = currentUser?.id === booking.host_id;
                    const bookingDate = new Date(booking.proposed_time);

                    return (
                      <div className="flex-1 border-2 border-[#141414] bg-white shadow-[4px_4px_0px_#141414] p-5 flex flex-col h-full overflow-y-auto">
                        {/* Header info */}
                        <div className="pb-3 border-b border-[#141414] mb-3 flex justify-between items-start">
                          <div>
                            <span className="text-[9.5px] font-mono opacity-50 uppercase tracking-widest block font-bold">
                              FlatMatch Tour Apppointments
                            </span>
                            <h2 className="text-sm font-black uppercase tracking-tight">
                              {booking.listing_title}
                            </h2>
                            <div className="text-[10px] font-bold text-stone-600 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-red-500" />{" "}
                              {booking.listing_address}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] font-mono opacity-50 block font-bold">
                              BOOKING CODE
                            </span>
                            <span className="text-[9.5px] font-mono font-bold bg-[#141414] text-[#D2F57C] px-1.5 py-0.5 border border-[#141414]">
                              {booking.id}
                            </span>
                          </div>
                        </div>

                        {/* Info columns */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="p-2.5 bg-[#F5F5F3] border border-[#141414] text-[10.5px]">
                            <span className="text-[8px] font-mono opacity-60 uppercase block font-bold mb-1">
                              Participants Matrix
                            </span>
                            <div className="space-y-1">
                              <div>
                                <span className="opacity-50 font-mono">
                                  Host:
                                </span>{" "}
                                <strong>{booking.host_name}</strong>{" "}
                                {isHost && (
                                  <span className="text-[8px] bg-[#141414] text-white px-1 ml-1 font-mono uppercase">
                                    You
                                  </span>
                                )}
                              </div>
                              <div>
                                <span className="opacity-50 font-mono">
                                  Room Seeker:
                                </span>{" "}
                                <strong>{booking.seeker_name}</strong>{" "}
                                {!isHost && (
                                  <span className="text-[8px] bg-[#141414] text-white px-1 ml-1 font-mono uppercase">
                                    You
                                  </span>
                                )}
                              </div>
                              <div>
                                <span className="opacity-50 font-mono font-bold">
                                  Proposed:
                                </span>{" "}
                                <strong className="text-indigo-700">
                                  {bookingDate.toLocaleString()}
                                </strong>
                              </div>
                            </div>
                          </div>

                          <div className="p-2.5 bg-[#F5F5F3] border border-[#141414] flex flex-col justify-between">
                            <div>
                              <span className="text-[8px] font-mono opacity-60 block font-bold uppercase mb-0.5">
                                Approval Status
                              </span>
                              <span
                                className={`inline-block text-[10px] font-black uppercase tracking-wide border px-2 py-0.5 mt-0.5 border-[#141414] ${
                                  booking.status === "accepted"
                                    ? "bg-[#D2F57C] text-black"
                                    : booking.status === "declined"
                                      ? "bg-red-100 text-red-700"
                                      : booking.status === "proposed_by_seeker"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {booking.status === "accepted"
                                  ? "Approved ✅"
                                  : booking.status === "declined"
                                    ? "Declined ❌"
                                    : booking.status === "proposed_by_seeker"
                                      ? "Pending Host Approval ⏳"
                                      : "Rescheduled 🔄"}
                              </span>
                            </div>
                            <div className="text-[8px] font-mono opacity-50 uppercase mt-1">
                              Ref hour:{" "}
                              {new Date(
                                booking.created_at,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-[9.5px] font-bold uppercase tracking-wider mb-1 font-mono">
                            Audit Booking specifications
                          </label>
                          <div className="w-full border border-[#141414] bg-neutral-50 p-2.5 text-xs font-serif leading-relaxed italic text-zinc-700">
                            "
                            {booking.notes ||
                              "No specialized viewing requirements submitted."}
                            "
                          </div>
                        </div>

                        {/* Interactive update actions */}
                        <div className="bg-amber-50/10 border border-[#141414] p-3 mb-3">
                          <span className="text-[9.5px] font-mono uppercase font-black block mb-2 text-zinc-700">
                            Actions Panel / Response Controls
                          </span>

                          <div className="flex flex-wrap gap-1.5">
                            {booking.status === "proposed_by_seeker" &&
                              isHost && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleUpdateScheduleStatus(
                                        booking.id,
                                        "accepted",
                                        "Host has approved and scheduled viewing!",
                                      )
                                    }
                                    className="bg-[#D2F57C] text-black hover:bg-[#c4e66d] font-black uppercase text-[9.5px] px-3 py-1.5 border border-[#141414] cursor-pointer shadow-[1px_1px_0px_#141414]"
                                  >
                                    Accept & Approve Slot Live
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleUpdateScheduleStatus(
                                        booking.id,
                                        "declined",
                                        "Host has declined this slot proposal.",
                                      )
                                    }
                                    className="bg-red-50 text-red-700 hover:bg-red-100 font-bold uppercase text-[9.5px] px-3 py-1.5 border border-[#141414] cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}

                            {booking.status === "proposed_by_host" &&
                              !isHost && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleUpdateScheduleStatus(
                                        booking.id,
                                        "accepted",
                                        "Seeker approved rescheduled counter proposal!",
                                      )
                                    }
                                    className="bg-[#D2F57C] text-black hover:bg-[#c4e66d] font-black uppercase text-[9.5px] px-3 py-1.5 border border-[#141414] cursor-pointer shadow-[1px_1px_0px_#141414]"
                                  >
                                    Accept Reschedule
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleUpdateScheduleStatus(
                                        booking.id,
                                        "declined",
                                        "Seeker declined rescheduled proposal.",
                                      )
                                    }
                                    className="bg-red-50 text-red-700 hover:bg-red-100 font-bold uppercase text-[9.5px] px-3 py-1.5 border border-[#141414] cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}

                            {booking.status !== "declined" && (
                              <div className="w-full mt-2 pt-2 border-t border-[#141414] border-dashed">
                                <span className="text-[8.5px] font-mono uppercase block font-black mb-1">
                                  🔄 Propose Alternative Viewing Slot Time
                                </span>
                                <div className="flex gap-1.5 items-center">
                                  <input
                                    type="datetime-local"
                                    value={rescheduleTime}
                                    onChange={(e) =>
                                      setRescheduleTime(e.target.value)
                                    }
                                    className="border border-[#141414] p-1 text-[11px] bg-white font-mono outline-none"
                                  />
                                  <button
                                    onClick={() =>
                                      handleUpdateScheduleStatus(
                                        booking.id,
                                        isHost
                                          ? "proposed_by_host"
                                          : "proposed_by_seeker",
                                        isHost
                                          ? "Rescheduled alternative suggested by Host."
                                          : "Alternative schedule proposed by Seeker.",
                                        rescheduleTime,
                                      )
                                    }
                                    className="bg-[#141414] text-white hover:bg-neutral-800 font-bold uppercase text-[9px] px-2.5 py-1.5 border border-[#141414] cursor-pointer"
                                  >
                                    Counter Propose
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Real calendar sync panel */}
                        <div className="border border-[#141414] bg-[#F5F5F3] p-3">
                          <span className="text-[9.5px] font-mono uppercase font-black block mb-1 text-stone-850 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-700 animate-pulse" />{" "}
                            Real Calendar Sync Integration
                          </span>
                          <p className="text-[9px] text-zinc-600 mb-2.5">
                            Synchronize to your real external work calendars
                            (GCal, Apple, Outlook) to enable tracking alerts.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            <a
                              href={getGoogleCalendarUrl(booking)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 bg-white hover:bg-neutral-50 text-[9px] border border-[#141414] px-2.5 py-1.5 font-bold uppercase"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-indigo-650" />
                              Sync Google Calendar
                            </a>
                            <button
                              onClick={() => handleExportICS(booking)}
                              className="inline-flex items-center gap-1 bg-white hover:bg-neutral-50 text-[9px] border border-[#141414] px-2.5 py-1.5 font-bold uppercase cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-green-700" />
                              Download .ICS File
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {!activeConversation && !selectedScheduleIdForView && (
                  <div className="border-2 border-dashed border-[#141414] bg-white p-12 text-center my-auto flex flex-col items-center justify-center">
                    <Calendar className="w-8 h-8 text-indigo-700 mb-2 animate-bounce" />
                    <div className="text-sm font-bold uppercase tracking-wider mb-1">
                      Select Chat Inbox or Viewing
                    </div>
                    <p className="text-xs opacity-60 max-w-sm">
                      Select an active conversation channel or open a Viewing
                      space tour from the sidebar index list on the left.
                    </p>
                  </div>
                )}
              </main>
            </div>
          )}

        {/* OWNER BULK HUB DASHBOARD VIEW */}
        {activeTab === "owner_dashboard" &&
          currentUser?.user_type === "owner" && (
            <div className="flex-1 flex overflow-hidden">
              {/* PROPERTY BULK CSV PASTING CONTAINER */}
              {showBulkImporter && (
                <aside className="w-[330px] border-r border-[#141414] flex flex-col bg-white shrink-0 p-4 justify-between overflow-y-auto">
                  <div>
                    <div className="pb-2 border-b border-[#141414] mb-3">
                      <h2 className="font-serif italic text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-indigo-600" />
                        Multi-Unit Bulk Importer
                      </h2>
                      <p className="text-[8.5px] font-mono opacity-60 uppercase mt-0.5">
                        Import multiple properties at once (CSV / JSON)
                      </p>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => {
                          setBulkFormat("csv");
                          setBulkInput(bulkInputCSV);
                        }}
                        className={`flex-1 text-[9px] py-1 border border-[#141414] font-bold uppercase transition-colors ${bulkFormat === "csv" ? "bg-[#141414] text-white" : "bg-white text-[#141414] hover:bg-neutral-100"}`}
                        title="Switch to CSV format (your text will be saved)"
                      >
                        CSV Column Format
                      </button>
                      <button
                        onClick={() => {
                          setBulkFormat("json");
                          setBulkInput(bulkInputJSON);
                        }}
                        className={`flex-1 text-[9px] py-1 border border-[#141414] font-bold uppercase transition-colors ${bulkFormat === "json" ? "bg-[#141414] text-white" : "bg-white text-[#141414] hover:bg-neutral-100"}`}
                        title="Switch to JSON format (your text will be saved)"
                      >
                        JSON Array Format
                      </button>
                    </div>

                    <textarea
                      value={bulkInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBulkInput(val);
                        if (bulkFormat === "csv") {
                          setBulkInputCSV(val);
                        } else {
                          setBulkInputJSON(val);
                        }
                      }}
                      className="w-full h-[280px] border border-[#141414] p-2 text-[9px] font-mono leading-tight outline-none bg-zinc-50"
                      placeholder="Paste CSV column records or valid JSON array..."
                    />

                    <button
                      onClick={handleBulkUpload}
                      className="w-full mt-3 bg-[#D2F57C] hover:bg-[#c3e66a] text-[#141414] py-2.5 text-[10px] font-bold uppercase tracking-wider border border-[#141414] cursor-pointer active:translate-y-[1px] shadow-[2px_2px_0px_#141414]"
                    >
                      Confirm & Batch Load Units
                    </button>

                    {bulkStatus && (
                      <div
                        className={`mt-3 p-2.5 border text-[9px] font-mono whitespace-pre-wrap ${bulkStatus.type === "success" ? "bg-green-50 border-green-400 text-green-800" : "bg-red-50 border-red-400 text-red-800"}`}
                      >
                        <strong>
                          {bulkStatus.type === "success"
                            ? "✔ Batch Successful:"
                            : "❌ Upload Error:"}
                        </strong>
                        <p className="mt-1">{bulkStatus.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-dashed border-zinc-400">
                    <div className="text-[8px] font-mono leading-snug text-zinc-500 uppercase bg-[#F5F5F3] p-2 border border-[#141414]">
                      💡 CSV Columns must keep titles corresponding precisely
                      to:
                      <strong className="block text-black mt-1">
                        title, description, listing_type, price_per_month,
                        deposit, address, latitude, longitude, apartment_type,
                        amenities, image_urls
                      </strong>
                    </div>
                  </div>
                </aside>
              )}

              {/* OWNER PROPERTIES INVENTORY */}
              <main className="flex-1 overflow-y-auto p-5 bg-[#E4E3E0] flex flex-col gap-4">
                {/* PLAN LEVEL CARD AT TOP */}
                <section className="border-2 border-[#141414] bg-white p-5 shadow-[4px_4px_0px_#141414]">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#141414]">
                    <div>
                      <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest block mb-1">
                        Landlord Management Suite
                      </span>
                      <h1 className="text-xl font-black uppercase tracking-tight">
                        Active Real Estate Portfolios
                      </h1>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowBulkImporter(!showBulkImporter)}
                        className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-[#141414] flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-[1px] shadow-[2px_2px_0px_#141414] ${showBulkImporter ? "bg-[#D2F57C] text-[#141414]" : "bg-white text-[#141414] hover:bg-[#F5F5F3]"}`}
                        title={
                          showBulkImporter
                            ? "Hide CSV / JSON bulk uploading options"
                            : "Reveal CSV / JSON bulk uploading options"
                        }
                      >
                        <Upload className="w-3.5 h-3.5 animate-pulse" />
                        {showBulkImporter
                          ? "Hide Bulk Importer"
                          : "Bulk Import Tools"}
                      </button>
                      <button
                        onClick={() => setShowNewListingModal(true)}
                        className="bg-[#141414] text-white hover:bg-neutral-800 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-[#141414] flex items-center gap-1 cursor-pointer active:translate-y-[1px] shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Publish Single Stay
                      </button>
                    </div>
                  </div>

                  {/* Sub levels tier switches */}
                  <div className="mb-2">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-extrabold block mb-1">
                      ⚙️ Sim Svc Tiers (Click Card to Alter Active Platform
                      Plan)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      {
                        key: "free",
                        label: "Free Tier",
                        price: "₹0/mo",
                        desc: "Max 1 listing",
                      },
                      {
                        key: "premium_seeker",
                        label: "Premium Seeker",
                        price: "₹249/mo",
                        desc: "Boost matches",
                      },
                      {
                        key: "owner_pro",
                        label: "Owner Pro",
                        price: "₹1,499/mo",
                        desc: "15 units active",
                      },
                      {
                        key: "owner_enterprise",
                        label: "Owner Enterprise",
                        price: "₹4,999/mo",
                        desc: "Unlimited API",
                      },
                    ].map((tier) => {
                      const isCurrent = currentUser?.tier === tier.key;
                      return (
                        <div
                          key={tier.key}
                          onClick={() => handleUpgradeTier(tier.key)}
                          className={`p-2.5 border cursor-pointer transition-all relative ${isCurrent ? "bg-[#141414] text-white border-[#141414] scale-102 shadow-md" : "bg-white text-[#141414] border-[#141414] hover:bg-[#F5F5F3]"}`}
                          title="Click to switch simulated premium features subscription plan"
                        >
                          <div className="text-[9px] font-mono opacity-60 font-black uppercase">
                            {tier.price}
                          </div>
                          <div className="text-[10.5px] font-extrabold leading-none my-0.5 uppercase tracking-tight">
                            {tier.label}
                          </div>
                          <p className="text-[8px] opacity-75">{tier.desc}</p>
                          {isCurrent && (
                            <span className="text-[7.5px] font-mono bg-[#D2F57C] text-black font-black px-1.5 py-0.2 uppercase mt-1 inline-block">
                              Active Plan
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* ACTIVE BULK INVENTORIES DATA TABLES */}
                <section className="border-2 border-[#141414] bg-white shadow-[4px_4px_0px_#141414] flex-1 flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-[#F5F5F3] border-b border-[#141414] text-xs font-black uppercase tracking-wider flex justify-between items-center">
                      <span>
                        Active Live Listings Catalog ({ownerListings.length})
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 font-normal">
                        Manage portfolios in Bengaluru
                      </span>
                    </div>

                    <div className="divide-y divide-[#141414] overflow-y-auto max-h-[290px]">
                      {ownerListings.length === 0 ? (
                        <div className="p-12 text-center text-xs text-zinc-500 italic font-mono">
                          No property assets published under this account.
                          <br />
                          Use CSV Bulk Importer on left drawer block to load
                          initial mock setups.
                        </div>
                      ) : (
                        ownerListings.map((l) => (
                          <div
                            key={l.id}
                            className="p-3 bg-white hover:bg-neutral-50 grid grid-cols-[1fr_80px_100px_120px] items-center gap-4 text-xs font-mono"
                          >
                            <div>
                              <span className="font-sans font-black text-xs text-[#141414] block truncate">
                                {l.title}
                              </span>
                              <span className="text-[9px] opacity-65 truncate block max-w-sm">
                                {l.address} (PIN: {l.pincode || "560038"})
                              </span>
                            </div>
                            <div>
                              <span className="font-extrabold text-[#141414] block uppercase text-[9px]">
                                {l.listing_type === "shared_stay"
                                  ? "Shared Stay"
                                  : "Entire Unit"}
                              </span>
                              <span className="text-[8.5px] opacity-50">
                                {l.room_size || l.apartment_type || "Custom"}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold text-green-700 block">
                                {formatPrice(l.price_per_month)}/mo
                              </span>
                              <span className="text-[8.5px] opacity-50">
                                Deposit: {formatPrice(l.deposit)}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 items-end text-right">
                              {l.is_verified ||
                              l.verification_status === "verified" ? (
                                <span className="text-[8px] bg-green-100 text-green-800 border border-green-400 px-1.5 py-0.5 font-bold uppercase tracking-wide rounded-sm mb-1">
                                  ✔ Verified Stay
                                </span>
                              ) : l.verification_status === "pending" ? (
                                <button
                                  onClick={() =>
                                    handleApproveVerificationSim(l.id)
                                  }
                                  className="px-1.5 py-0.5 border border-amber-500 text-amber-800 bg-[#FFFBEB] hover:bg-amber-100 uppercase text-[8px] font-black rounded-none mb-1 animate-pulse"
                                  title="Click to simulate instant administrative KYC approval!"
                                >
                                  ⏳ Approve (SIM)
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setVerifyingListingId(l.id);
                                    setShowVerifyModal(true);
                                  }}
                                  className="px-1.5 py-0.5 border border-blue-600 text-blue-700 bg-[#EFF6FF] hover:bg-blue-100 uppercase text-[8px] font-black rounded-none mb-1"
                                >
                                  Verify Asset
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteListing(l.id)}
                                className="text-red-600 hover:text-red-800 uppercase text-[8px] font-bold underline cursor-pointer"
                              >
                                Deactivate
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="p-3 border-t border-[#141414] bg-[#F5F5F3] text-[9.5px] font-mono text-zinc-500 uppercase flex justify-between">
                    <span>Owner Level Pro Access Enabled</span>
                    <span>Unlimited database queries active</span>
                  </div>
                </section>
              </main>
            </div>
          )}

        {/* MY PREFERENCES TAB VIEW */}
        {activeTab === "profile" && (
          <div className="flex-1 bg-[#E4E3E0] p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto border-2 border-[#141414] bg-white p-6 shadow-[6px_6px_0px_#141414]">
              {currentUser?.user_type === "owner" ? (
                // --- LANDLORD / PROPERTY POLICY MANAGEMENT SETTINGS ---
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-[#141414] mb-4">
                    <div>
                      <h1 className="text-xl font-black uppercase tracking-tight">
                        Property Policy & Tenant Rules Manager
                      </h1>
                      <p className="text-[9px] font-mono opacity-50 uppercase mt-0.5">
                        Configure target tenant requirements and house
                        expectations for your rental portfolio
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono opacity-55">
                        Landlord ID:
                      </span>
                      <span className="block text-xs font-bold font-mono">
                        {currentUser?.id}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {/* Basic Company & Landlord Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono text-zinc-700">
                          Landlord Representative Name
                        </label>
                        <input
                          type="text"
                          className="w-full border border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none font-bold"
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono text-zinc-700">
                          Simulated Contact Mobile (shown in stays)
                        </label>
                        <input
                          type="text"
                          className="w-full border border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none font-mono"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pb-2 border-b border-[#141414] border-dashed">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono text-zinc-700">
                          Years of Property Experience
                        </label>
                        <input
                          type="number"
                          className="w-full border border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none"
                          value={editAge}
                          onChange={(e) => setEditAge(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono text-zinc-700">
                          Target Tenant Gender Cohort
                        </label>
                        <select
                          className="w-full border border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none rounded-none"
                          value={editGender}
                          onChange={(e) => setEditGender(e.target.value)}
                        >
                          <option value="Not Specified">
                            No Specific Gender Restriction (Co-ed)
                          </option>
                          <option value="Male">Prefer Male Cohort</option>
                          <option value="Female">Prefer Female Cohort</option>
                          <option value="Non-Binary">
                            Prefer Diverse Cohort
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono text-zinc-700">
                          Agency / Corporate Registry Brand
                        </label>
                        <input
                          type="text"
                          className="w-full border border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none"
                          value={editProfession}
                          placeholder="e.g. Individual Owner, Prestige Stays"
                          onChange={(e) => setEditProfession(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* About Landlord / Property Policies */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono text-zinc-700">
                        Property Management Greeting & Rules Summary (Visible to
                        Renters)
                      </label>
                      <textarea
                        className="w-full border border-[#141414] p-2.5 text-xs bg-[#F5F5F3] h-20 outline-none font-serif leading-relaxed"
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Explain expected standards of hygiene, quiet hours guidelines, tenant communication channels, and lease renewal boundaries..."
                      />
                    </div>

                    {/* Algorithmic matching fields */}
                    <div className="bg-indigo-50 p-4 border border-[#141414] space-y-3">
                      <div className="text-[10px] font-mono font-extrabold uppercase text-[#141414] tracking-widest pb-1 border-b border-[#141414]">
                        🏡 Tenant Suitability Policy & House Rules
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold uppercase text-zinc-700">
                              Expected Tenant Tidiness Standard
                            </label>
                            <span className="font-extrabold">
                              {editCleanliness} / 5
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={editCleanliness}
                            onChange={(e) =>
                              setEditCleanliness(Number(e.target.value))
                            }
                            className="w-full accent-[#141414]"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold uppercase text-zinc-700">
                              Target Monthly Rent Budget Limits Offered
                            </label>
                            <span className="font-sans font-bold text-zinc-800">
                              {formatPrice(editBudgetMin)} -{" "}
                              {formatPrice(editBudgetMax)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="300"
                              max="1000000"
                              value={editBudgetMin}
                              onChange={(e) =>
                                setEditBudgetMin(Number(e.target.value))
                              }
                              className="w-1/2 border border-[#141414] p-1 text-[11px] bg-white text-[#141414] outline-none"
                            />
                            <input
                              type="number"
                              min="300"
                              max="1000000"
                              value={editBudgetMax}
                              onChange={(e) =>
                                setEditBudgetMax(Number(e.target.value))
                              }
                              className="w-1/2 border border-[#141414] p-1 text-[11px] bg-white text-[#141414] outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                        <div>
                          <label className="block text-[9px] font-bold uppercase mb-1 text-zinc-600">
                            WFH Lifestyle Support
                          </label>
                          <select
                            value={editWfh}
                            onChange={(e: any) => setEditWfh(e.target.value)}
                            className="w-full border border-[#141414] bg-white p-1 text-[11px] rounded-none shadow-sm"
                          >
                            <option value="office">
                              Suited primarily for commuter/offline workers
                            </option>
                            <option value="hybrid">
                              Suited easily for Hybrid routines
                            </option>
                            <option value="wfh">
                              Equipped with reliable desks & power backups for
                              permanent WFH
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase mb-1 text-zinc-600">
                            Quiet Hours Expectation
                          </label>
                          <select
                            value={editSleeping}
                            onChange={(e: any) =>
                              setEditSleeping(e.target.value)
                            }
                            className="w-full border border-[#141414] bg-white p-1 text-[11px] rounded-none shadow-sm"
                          >
                            <option value="early_bird">
                              Strict early hours quiet zone required
                            </option>
                            <option value="night_owl">
                              Flexible late-hours friendly premise
                            </option>
                            <option value="flexible">
                              Discretionary / No formal limits
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase mb-1 text-zinc-600">
                            Premise Gathering/Party Policy
                          </label>
                          <select
                            value={editDrinking}
                            onChange={(e: any) =>
                              setEditDrinking(e.target.value)
                            }
                            className="w-full border border-[#141414] bg-white p-1 text-[11px] rounded-none shadow-sm"
                          >
                            <option value="never">
                              Parties or substance gatherings strictly
                              prohibited
                            </option>
                            <option value="socially">
                              Social guests and occasional meetups permitted
                            </option>
                            <option value="regularly">
                              Flexible social guidelines
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs select-none font-mono">
                          <input
                            type="checkbox"
                            checked={editSmoker}
                            onChange={(e) => setEditSmoker(e.target.checked)}
                            className="w-4 h-4 accent-[#141414] border border-[#141414]"
                          />
                          <span>Smoking Permitted on Premises / Balcony</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs select-none font-mono">
                          <input
                            type="checkbox"
                            checked={editPetsAllowed}
                            onChange={(e) =>
                              setEditPetsAllowed(e.target.checked)
                            }
                            className="w-4 h-4 accent-[#141414] border border-[#141414]"
                          />
                          <span>Pets and Animals Friendly</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-4 pt-2">
                      {profileSaveStatus === "updating" ? (
                        <span className="text-xs font-mono opacity-70 flex items-center gap-1">
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />{" "}
                          Save changes operating...
                        </span>
                      ) : profileSaveStatus === "success" ? (
                        <span className="text-xs font-mono text-green-700 font-bold">
                          ✓ Property Management Criteria successfully
                          synchronized!
                        </span>
                      ) : profileSaveStatus === "error" ? (
                        <span className="text-xs font-mono text-red-650 font-bold">
                          ❌ Save failed. Verify parameter constraints.
                        </span>
                      ) : (
                        <div />
                      )}

                      <button
                        type="submit"
                        className="bg-[#141414] text-white hover:bg-neutral-800 px-6 py-2.5 text-xs font-bold uppercase tracking-widest border border-[#141414] shadow-[3px_3px_0px_rgba(0,0,0,0.355)] cursor-pointer"
                      >
                        Save Landlord Profile
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                // --- ROOMMATE / SEEKER PREFERENCES ---
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-[#141414] mb-4">
                    <div>
                      <h1 className="text-xl font-black uppercase tracking-tight">
                        Preferences Matrix Settings
                      </h1>
                      <p className="text-[9px] font-mono opacity-50 uppercase mt-0.5">
                        Modifying this matrix recalibrates the roommate matching
                        score instantly
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono opacity-55">
                        Account ID:
                      </span>
                      <span className="block text-xs font-bold font-mono">
                        {currentUser?.id}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {/* Basic Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="w-full border border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none"
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono">
                          Simulated Mobile (hidden inside platform)
                        </label>
                        <input
                          type="text"
                          className="w-full border border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pb-2 border-b border-[#141414] border-dashed">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono">
                          Age (Years)
                        </label>
                        <input
                          type="number"
                          className="w-full border border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none"
                          value={editAge}
                          onChange={(e) => setEditAge(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono">
                          Gender Identification
                        </label>
                        <select
                          className="w-full border border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none rounded-none"
                          value={editGender}
                          onChange={(e) => setEditGender(e.target.value)}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-Binary">Non-Binary</option>
                          <option value="Not Specified">Not Specified</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono">
                          Active Profession / Occupation
                        </label>
                        <input
                          type="text"
                          className="w-full border border-[#141414] p-2 text-xs bg-[#F5F5F3] outline-none"
                          value={editProfession}
                          onChange={(e) => setEditProfession(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Profile bio */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono">
                        Personal Introduction Bio (displayed to matches)
                      </label>
                      <textarea
                        className="w-full border border-[#141414] p-2.5 text-xs bg-[#F5F5F3] h-20 outline-none font-serif leading-relaxed"
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Describe your schedule, shared values, habits, boundaries..."
                      />
                    </div>

                    {/* Algorithmic matching fields */}
                    <div className="bg-[#D2F57C]/10 p-4 border border-[#141414] space-y-3">
                      <div className="text-[10px] font-mono font-extrabold uppercase text-[#141414] tracking-widest pb-1 border-b border-[#141414]">
                        🧬 Algorithmic Compatibility Weights
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold uppercase">
                              Hygiene & Cleanliness Level
                            </label>
                            <span className="font-extrabold">
                              {editCleanliness} / 5
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={editCleanliness}
                            onChange={(e) =>
                              setEditCleanliness(Number(e.target.value))
                            }
                            className="w-full accent-[#141414]"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold uppercase">
                              Budget Limits (Monthly)
                            </label>
                            <span className="font-sans font-bold">
                              {formatPrice(editBudgetMin)} -{" "}
                              {formatPrice(editBudgetMax)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="300"
                              max="8000"
                              value={editBudgetMin}
                              onChange={(e) =>
                                setEditBudgetMin(Number(e.target.value))
                              }
                              className="w-1/2 border border-[#141414] p-1 text-[11px] bg-white outline-none"
                            />
                            <input
                              type="number"
                              min="300"
                              max="8000"
                              value={editBudgetMax}
                              onChange={(e) =>
                                setEditBudgetMax(Number(e.target.value))
                              }
                              className="w-1/2 border border-[#141414] p-1 text-[11px] bg-white outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                        <div>
                          <label className="block text-[9px] font-bold uppercase mb-1">
                            Workspace Style
                          </label>
                          <select
                            value={editWfh}
                            onChange={(e: any) => setEditWfh(e.target.value)}
                            className="w-full border border-[#141414] bg-white p-1 text-[11px] rounded-none shadow-sm"
                          >
                            <option value="office">Office commuting</option>
                            <option value="hybrid">Hybrid Routine</option>
                            <option value="wfh">Full WFH Desk</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase mb-1">
                            Sleeping Cycle
                          </label>
                          <select
                            value={editSleeping}
                            onChange={(e: any) =>
                              setEditSleeping(e.target.value)
                            }
                            className="w-full border border-[#141414] bg-white p-1 text-[11px] rounded-none shadow-sm"
                          >
                            <option value="early_bird">Early Bird</option>
                            <option value="night_owl">Night Owl</option>
                            <option value="flexible">
                              Flexible biological
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase mb-1">
                            Social Drinking
                          </label>
                          <select
                            value={editDrinking}
                            onChange={(e: any) =>
                              setEditDrinking(e.target.value)
                            }
                            className="w-full border border-[#141414] bg-white p-1 text-[11px] rounded-none shadow-sm"
                          >
                            <option value="never">Never</option>
                            <option value="socially">Socially Toasting</option>
                            <option value="regularly">Regularly</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                          <input
                            type="checkbox"
                            checked={editSmoker}
                            onChange={(e) => setEditSmoker(e.target.checked)}
                            className="w-4 h-4 accent-[#141414] border border-[#141414]"
                          />
                          <span>Active Smoker (or smoke tolerating)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                          <input
                            type="checkbox"
                            checked={editPetsAllowed}
                            onChange={(e) =>
                              setEditPetsAllowed(e.target.checked)
                            }
                            className="w-4 h-4 accent-[#141414] border border-[#141414]"
                          />
                          <span>Pets and Animals Friendly</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-4">
                      {profileSaveStatus === "updating" ? (
                        <span className="text-xs font-mono opacity-70 flex items-center gap-1">
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />{" "}
                          Save changes operating...
                        </span>
                      ) : profileSaveStatus === "success" ? (
                        <span className="text-xs font-mono text-green-700 font-bold">
                          ✓ Preferences successfully synchronized across server!
                        </span>
                      ) : profileSaveStatus === "error" ? (
                        <span className="text-xs font-mono text-red-650 font-bold">
                          ❌ Save failed. Verify parameter constraints.
                        </span>
                      ) : (
                        <div />
                      )}

                      <button
                        type="submit"
                        className="bg-[#141414] text-white hover:bg-neutral-800 px-6 py-2.5 text-xs font-bold uppercase tracking-widest border border-[#141414] shadow-[3px_3px_0px_rgba(0,0,0,0.35)] cursor-pointer"
                      >
                        Save Matrix Coordinates
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER AREA STATUS BAR (32px h) */}
      <footer className="h-8 border-t border-[#141414] bg-white flex items-center justify-between px-4 text-[9px] font-mono uppercase opacity-55 shrink-0 z-10 select-none">
        <div>
          Development Node: Ready // Active User UUID:{" "}
          <span className="font-bold underline">
            {currentUser?.id || "seeker-1"}
          </span>
        </div>
        <div>
          &copy; 2026 FLATMATCH SaaS PLATFORM INC. // ALL RIGHTS SECURED
        </div>
      </footer>

      {/* MODAL 2: PUBLISH STAY/UNIT LISTINGS */}
      {showNewListingModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#141414] max-w-lg w-full p-5 shadow-[8px_8px_0px_#141414] relative max-h-[660px] overflow-y-auto">
            <button
              onClick={() => setShowNewListingModal(false)}
              className="absolute top-3 right-3 text-[#141414] hover:text-zinc-600 outline-none"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pb-2 border-b border-[#141414] mb-3">
              <h3 className="font-serif italic text-sm font-bold uppercase tracking-tight">
                Create Stay Listing Record
              </h3>
              <p className="text-[8.5px] font-mono opacity-50 uppercase">
                Publish rent assets directly into FlatMatch Directory
              </p>
            </div>

            <form
              onSubmit={handleCreateListing}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono font-bold mb-1">
                    Listing Category
                  </label>
                  <select
                    value={newListingType}
                    onChange={(e: any) => setNewListingType(e.target.value)}
                    className="w-full border border-[#141414] bg-[#F5F5F3] p-1.5 rounded-none"
                  >
                    <option value="shared_stay">
                      Shared Stay (Existing Tenant room)
                    </option>
                    <option value="entire_unit">
                      Entire vacant unit (Landlord/Owner)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold mb-1">
                    Rent Title headings
                  </label>
                  <input
                    type="text"
                    value={newListingTitle}
                    onChange={(e) => setNewListingTitle(e.target.value)}
                    placeholder="e.g. Premium 2BHK Cozy Stay in Indiranagar"
                    className="w-full border border-[#141414] p-1.5 bg-[#F5F5F3]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-mono font-bold mb-1">
                    Rent share (₹/month)
                  </label>
                  <input
                    type="number"
                    value={newListingPrice}
                    onChange={(e) => setNewListingPrice(e.target.value)}
                    className="w-full border border-[#141414] p-1.5 bg-[#F5F5F3]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold mb-1">
                    Lease Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={newListingDeposit}
                    onChange={(e) => setNewListingDeposit(e.target.value)}
                    className="w-full border border-[#141414] p-1.5 bg-[#F5F5F3]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold mb-1">
                    Location street Address
                  </label>
                  <input
                    type="text"
                    value={newListingAddress}
                    onChange={(e) => setNewListingAddress(e.target.value)}
                    placeholder="e.g. 100 Feet Road, HAL 2nd Stage"
                    className="w-full border border-[#141414] p-1.5 bg-[#F5F5F3]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-mono font-bold mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newListingCity}
                    onChange={(e) => setNewListingCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full border border-[#141414] p-1.5 bg-[#F5F5F3]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={newListingState}
                    onChange={(e) => setNewListingState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full border border-[#141414] p-1.5 bg-[#F5F5F3]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold mb-1">
                    PIN Code (6 digits)
                  </label>
                  <input
                    type="text"
                    value={newListingPincode}
                    onChange={(e) => setNewListingPincode(e.target.value)}
                    placeholder="e.g. 560038"
                    maxLength={6}
                    className="w-full border border-[#141414] p-1.5 bg-[#F5F5F3]"
                    required
                  />
                </div>
              </div>

              {newListingType === "shared_stay" ? (
                <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-100 border border-[#141414]">
                  <div>
                    <label className="block text-[9px] font-mono font-bold mb-1">
                      Room Size
                    </label>
                    <input
                      type="text"
                      value={newListingRoomSize}
                      onChange={(e) => setNewListingRoomSize(e.target.value)}
                      placeholder="e.g. 12' x 14'"
                      className="w-full border border-[#141414] p-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold mb-1">
                      Utility split terms
                    </label>
                    <input
                      type="text"
                      value={newListingUtility}
                      onChange={(e) => setNewListingUtility(e.target.value)}
                      className="w-full border border-[#141414] p-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold mb-1">
                      Existing Flatmates
                    </label>
                    <input
                      type="number"
                      value={newListingFlatmates}
                      onChange={(e) => setNewListingFlatmates(e.target.value)}
                      className="w-full border border-[#141414] p-1.5 bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-neutral-100 border border-[#141414]">
                  <label className="block text-[9px] font-mono font-bold mb-1">
                    Apartment Layout Type
                  </label>
                  <select
                    value={newListingUnitType}
                    onChange={(e: any) => setNewListingUnitType(e.target.value)}
                    className="w-full border border-[#141414] bg-white p-1.5"
                  >
                    <option value="Studio Flat">Studio Flat</option>
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="3BHK">3BHK</option>
                    <option value="PG">PG / Paying Guest</option>
                    <option value="Independent House">Independent House</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-mono font-bold mb-1">
                  Included Amenities (comma separated)
                </label>
                <input
                  type="text"
                  value={newListingAmenities}
                  onChange={(e) => setNewListingAmenities(e.target.value)}
                  placeholder="Gym, Pool, Security, Parking, Central AC"
                  className="w-full border border-[#141414] p-1.5 bg-[#F5F5F3]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold mb-1">
                  Cover Image scene photo URL
                </label>
                <input
                  type="text"
                  value={newListingImg}
                  onChange={(e) => setNewListingImg(e.target.value)}
                  placeholder="https://images.unsplash.com/... or blank"
                  className="w-full border border-[#141414] p-1.5 bg-[#F5F5F3] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 p-2.5 bg-red-50/70 border-2 border-red-400">
                <div>
                  <label className="block text-[9.5px] font-mono font-bold mb-1 text-red-800">
                    Roommate Gender Pref *
                  </label>
                  <select
                    value={newListingGender}
                    onChange={(e: any) => setNewListingGender(e.target.value)}
                    className="w-full border border-red-300 bg-white p-1.5 rounded-none font-semibold text-red-900 outline-none"
                    required
                  >
                    <option value="No preference">No preference</option>
                    <option value="Girls only">Girls only</option>
                    <option value="Boys only">Boys only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9.5px] font-mono font-bold mb-1 text-red-800">
                    Mandatory House Rules / Restrictions *
                  </label>
                  <input
                    type="text"
                    value={newListingRestrictions}
                    onChange={(e) => setNewListingRestrictions(e.target.value)}
                    placeholder="e.g. No smoking indoors, No pet birds, Quiet after 11 PM"
                    className="w-full border border-red-300 p-1.5 bg-white font-semibold text-red-950 placeholder-red-350 outline-none"
                    required
                  />
                  <p className="text-[7.5px] text-red-600 mt-1 font-mono">
                    Minimum 1 limit required; separate by comma
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold mb-1">
                  Description
                </label>
                <textarea
                  value={newListingDesc}
                  onChange={(e) => setNewListingDesc(e.target.value)}
                  className="w-full border border-[#141414] p-2 bg-[#F5F5F3] h-16 outline-none"
                  placeholder="Describe your flatmate/tenant stay expectation details..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#141414] text-white hover:bg-neutral-800 py-2.5 border border-[#141414] uppercase text-[10px] font-bold tracking-widest shadow-[3px_3px_0px_rgba(0,0,0,0.25)] cursor-pointer"
              >
                Confirm Stay Publish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PLATONIC TRUST AND SAFETY REPORTING */}
      {showReportModal && reportedUser && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-red-600 max-w-md w-full p-5 shadow-[8px_8px_0px_rgba(220,38,38,1)] relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-3 right-3 text-[#141414] hover:text-zinc-650 outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pb-2 border-b-2 border-red-500 mb-3 flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <div>
                <h3 className="font-serif italic text-xs font-bold uppercase tracking-tight text-red-700">
                  Flag Inappropriate Contact
                </h3>
                <p className="text-[8.5px] font-mono opacity-60 uppercase">
                  FlatMatch Trust & Platonic Safety Guardianship
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSendReport}
              className="space-y-3.5 text-xs text-[#141414]"
            >
              <div>
                <label className="block text-[9px] font-mono font-bold mb-1">
                  User being reported
                </label>
                <div className="p-2 bg-neutral-100 border border-neutral-300 font-bold font-mono text-[10.5px]">
                  {reportedUser.full_name} ({reportedUser.email})
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold mb-1">
                  Category of concern
                </label>
                <select
                  value={reportReason}
                  onChange={(e: any) => setReportReason(e.target.value)}
                  className="w-full border border-red-400 bg-[#FFF5F5] p-1.5 focus:ring-1 focus:ring-red-500 rounded-none font-bold text-red-900 leading-none outline-none"
                >
                  <option value="Romantic solicitation / dating-like behavior">
                    Romantic solicitation / Dating-like behavior
                  </option>
                  <option value="Inappropriate flirting or pickup lines">
                    Inappropriate flirting or pickup lines
                  </option>
                  <option value="Harassment or offensive language">
                    Harassment or offensive language
                  </option>
                  <option value="Spam or fake listings / scam attempt">
                    Spam or fake listings / scam attempt
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold mb-1">
                  Specific details or message text evidence
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full border border-[#141414] p-2 bg-[#F5F5F3] h-20 outline-none rounded-none"
                  placeholder="Tell us what statements, flirting or behaviors took place. Our team reviews all conversations."
                  required
                />
              </div>

              <div className="p-2.5 bg-red-50 text-[10px] text-red-800 border border-red-350 leading-snug font-medium">
                <strong>Important:</strong> FlatMatch is strictly platonic.
                Sending false claims is also a violation. Safe spaces are
                maintained by objective audits. Thank you for reporting!
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-white hover:bg-neutral-100 py-2 border border-[#141414] uppercase text-[9.5px] font-bold tracking-wider cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white hover:bg-red-700 py-2 border border-[#141414] uppercase text-[9.5px] font-bold tracking-wider shadow-[3px_3px_0px_#141414] active:shadow-none translate-y-0 active:translate-y-[2px] cursor-pointer"
                >
                  Submit Safe Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}
