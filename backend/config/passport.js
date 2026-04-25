import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          let user = await User.findOne({ email });

          if (user) {
            // Unify account if exists
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          } else {
            // New user, defaults to 'artist' if no role is chosen during oauth,
            // but we can let them update it later in /complete-profile
            user = await User.create({
              name: profile.displayName,
              email,
              role: 'artist', // default, to be updated
              authProvider: 'google',
              googleId: profile.id,
              avatar: profile.photos[0] ? profile.photos[0].value : '',
            });
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : null;
          if (!email) {
            return done(new Error('GitHub email is private or not available'), false);
          }
          let user = await User.findOne({ email });

          if (user) {
            if (!user.githubId) {
              user.githubId = profile.id;
              await user.save();
            }
            return done(null, user);
          } else {
            user = await User.create({
              name: profile.displayName || profile.username,
              email,
              role: 'artist', // default
              authProvider: 'github',
              githubId: profile.id,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
            });
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

export default passport;
