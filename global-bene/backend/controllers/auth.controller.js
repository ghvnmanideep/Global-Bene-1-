const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const { OAuth2Client } = require('google-auth-library');
const { logActivity } = require('../utils/logActivity.utils');
const { setUserProfile, setUserSegmentation } = require('../utils/mixpanelTracker');
const { getUserSegmentationData } = require('../utils/userSegmentation');
// const { sendMail } = require('../utils/email.util'); // Commented out for now - using nodemailer


// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  // Helper to generate JWT

// Environment variables or defaults
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Password validation regex
const strongPassword = (pw) =>
  /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).*$/.test(pw);

// Utility to generate tokens
const generateToken = () => crypto.randomBytes(20).toString('hex');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// JWT token generator
const createAccessToken = (user) =>
  jwt.sign({ id: user._id, username: user.username, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '15m' });

// --------- REGISTER ---------
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const userRole = role || 'user';

    // Validate password strength
    if (!strongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters, include uppercase, lowercase, number and symbol' });
    }

    // Trim and prepare data
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingEmail = await User.findOne({ email: trimmedEmail.toLowerCase() });
    if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

    const existingUsername = await User.findOne({ username: trimmedUsername.replace(/\s+/g, '').toLowerCase() });
    if (existingUsername) return res.status(400).json({ message: 'Username already exists' });

    // Store plain password - pre-save hook will hash it
    const user = new User({ username: trimmedUsername.replace(/\s+/g, '').toLowerCase(), email: trimmedEmail, passwordHash: password, role: userRole });
    await user.save();

    // Store complete user data in Mixpanel
    setUserProfile(user._id.toString(), {
      email: trimmedEmail,
      username: trimmedUsername,
      role: userRole,
      createdAt: user.createdAt.toISOString(),
      emailVerified: user.emailVerified,
      account_status: 'active',
      user_role: userRole,
      bio: '',
      followers_count: 0,
      following_count: 0,
      posts_count: 0,
      communities_joined: 0,
      total_interactions: 0,
      email_notifications: true,
      push_notifications: true,
      theme_preference: 'system'
    });

    // Set initial user segmentation data for user-wise analytics
    const initialSegmentation = {
      activityLevel: 'inactive', // New user starts as inactive
      engagementScore: 0,
      lastActivityDate: new Date().toISOString(),
      daysSinceRegistration: 0,
      daysSinceLastActivity: 0,
      userCohort: 'new_this_month',
      totalPostsCreated: 0,
      totalCommentsMade: 0,
      totalCommunitiesJoined: 0,
      totalLikesGiven: 0,
      totalSharesMade: 0,
      preferredCategories: [],
      preferredTopics: [],
      accountStatus: 'active',
      isPremium: false,
      notificationPreferences: {}
    };
    setUserSegmentation(user._id.toString(), initialSegmentation);

    // Log registration activity
    await logActivity(
      user._id,
      "register",
      `User registered with email ${trimmedEmail}`,
      req,
      null,
      null
    );

    // TEMPORARY: Skip email verification for testing - auto-verify user
    user.emailVerified = true;
    await user.save();

    // Log registration activity
    await logActivity(
      user._id,
      "register",
      `User registered and auto-verified for testing`,
      req,
      null,
      null
    );

    // Generate access token for immediate login
    const token = createAccessToken(user);

    res.status(201).json({
      message: 'Registered and verified successfully!',
      accessToken: token,
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role || 'user',
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --------- LOGIN ---------
exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginIdentifier = username || email;
    // console.log('Login attempt:', { loginIdentifier, password: !!password });

    if (!loginIdentifier || !password)
      return res.status(400).json({ message: 'Username/email and password are required' });

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: loginIdentifier.replace(/\s+/g, '').toLowerCase() }, // Canonical username (no spaces, lowercase)
        { email: loginIdentifier.toLowerCase() } // Canonical email (lowercase)
      ]
    });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ message: 'Please log in with Google for this account' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    // console.log('Password match:', isMatch);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid username or password' });

    const token = createAccessToken(user);

    // Log login activity
    await logActivity(
      user._id,
      "login",
      `User logged in successfully`,
      req,
      null,
      null
    );

    // Update Mixpanel profile with login information
    setUserProfile(user._id.toString(), {
      $last_login: new Date().toISOString(),
      last_activity: new Date().toISOString()
    });

    res.json({
      accessToken: token,
      token, // Keep both for backward compatibility
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role || 'user',
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// --------- PASSWORD RESET ---------
exports.verifyUserForPasswordReset = async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: 'Username and email are required.' });
  }

  try {
    const user = await User.findOne({ 
      username: username.trim().replace(/\s+/g, '').toLowerCase(), // Use canonical username
      email: email.trim().toLowerCase() // Use canonical email
    });

    if (!user) {
      return res.status(404).json({ message: 'Invalid credentials. No matching account found.' });
    }

    // User is verified
    res.status(200).json({ message: 'User verified successfully.' });
  } catch (error) {
    console.error('Error during user verification for reset:', error);
    res.status(500).json({ message: 'Server error during verification.' });
  }
};


exports.resetPasswordWithoutToken = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and new password are required.' });
  }

  if (!strongPassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters, include uppercase, lowercase, number and symbol' });
  }

  try {
    // Re-verify the user for security before changing the password
    const user = await User.findOne({ 
      username: username.trim().replace(/\s+/g, '').toLowerCase(), // Use canonical username
      email: email.trim().toLowerCase() // Use canonical email
    });

    if (!user) {
      return res.status(404).json({ message: 'Invalid credentials. Cannot reset password.' });
    }

    // Set the plain password; the pre-save hook in the User model will hash it automatically.
    user.passwordHash = password;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Error during direct password reset:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
};

// --------- GET MY PROFILE ---------
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash -resetToken -emailToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// --------- FOLLOW USER ---------
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    // Log follow activity
    await logActivity(
      currentUserId,
      "follow-user",
      `User followed ${userToFollow.username}`,
      req,
      "user",
      userId
    );

    res.json({ message: 'User followed successfully' });
  } catch (err) {
    console.error('Follow user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --------- UNFOLLOW USER ---------
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await userToUnfollow.save();

    // Log unfollow activity
    await logActivity(
      currentUserId,
      "unfollow-user",
      `User unfollowed ${userToUnfollow.username}`,
      req,
      "user",
      userId
    );

    res.json({ message: 'User unfollowed successfully' });
  } catch (err) {
    console.error('Unfollow user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --------- GET USER BY ID ---------
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash -resetToken -emailToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --------- UPDATE PROFILE ---------
exports.updateProfile = async (req, res) => {
  try {
    const { bio, mobile, gender, dob, username } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Handle username change
    if (username !== undefined) {
      const trimmedUsername = username.trim();
      const lowerUsername = trimmedUsername.toLowerCase();
      if (lowerUsername !== user.username.toLowerCase()) {
        // Check if new username is taken by another user
        const existingUsername = await User.findOne({ username: lowerUsername });
        if (existingUsername && existingUsername._id.toString() !== user._id.toString()) {
          return res.status(400).json({ message: 'Username already exists' });
        }
        user.username = lowerUsername;
      }
    }

    if (req.file && req.file.path) {
      user.profile.avatarUrl = req.file.path;
      if (req.file.filename) user.profile.avatarPublicId = req.file.filename;
    }

    user.profile = {
      ...user.profile,
      bio: bio || user.profile?.bio,
      mobile: mobile || user.profile?.mobile,
      gender: gender || user.profile?.gender,
      dob: dob || user.profile?.dob,
      avatarUrl: user.profile.avatarUrl,
    };

    await user.save();

    // Log profile update activity
    await logActivity(
      req.user._id,
      "update-profile",
      `User updated profile information`,
      req,
      null,
      null
    );

    res.json({ message: 'Profile updated', profile: user.profile, username: user.username });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --------- CHANGE PASSWORD ---------
exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!strongPassword(newPassword))
      return res.status(400).json({ message: 'Password must be at least 8 characters, include uppercase, lowercase, number and symbol' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Store plain password - pre-save hook will hash it
    user.passwordHash = newPassword;
    user.refreshTokens = [];
    await user.save();

    // Log password change activity
    await logActivity(
      req.user._id,
      "change-password",
      `User changed password`,
      req,
      null,
      null
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



// ------------------------ GOOGLE LOGIN ------------------------
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Missing Google token" });

    // Verify token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // New user
      user = new User({
        username: name.replace(/\s+/g, "").toLowerCase(),
        email,
        googleId: sub,
        emailVerified: true,
        profile: { avatarUrl: picture },
      });
      await user.save();
    }

    // Generate JWT
    const accessToken = createAccessToken(user);

    // Log Google login activity
    await logActivity(
      user._id,
      "login",
      `User logged in with Google`,
      req,
      null,
      null
    );

    // Update Mixpanel profile with login information
    setUserProfile(user._id.toString(), {
      $last_login: new Date().toISOString(),
      last_activity: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "user",
      },
      token: accessToken,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Server error during Google authentication" });
  }
};
