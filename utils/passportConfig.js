const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Customer = require("../models/Customer");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/social/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Validate the profile object
        if (!profile || !profile.id || !profile.displayName || !profile.emails || !profile.photos) {
          return done(new Error("Invalid profile"), null);
        }

        // Find or create the user based on Google profile information
        let user = await Customer.findOne({
          where: { email: profile.emails[0].value },
        });

        if (!user) {
          user = await Customer.create({
            customerId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            isEnabled: true,
            imageUrl: profile.photos[0].value,
          });
        }

        return done(null, user);
      } catch (err) {
        // Log the original error for debugging purposes
        console.error(err);
        return done(err, null);
      }
    }
  )
);

// Serialize and deserialize user (For session handling)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Customer.findByPk(id);
    if (!user) {
      return done(new Error("User not found"), null);
    }
    done(null, user);
  } catch (err) {
    // Log the original error for debugging purposes
    console.error(err);
    done(new Error("Error deserializing user"), null);
  }
});