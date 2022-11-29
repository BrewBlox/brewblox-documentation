# Upcoming release notes

**Changes:**

- (feature) The Spark service now automatically generates backup files.
  - A new file is created every day.
  - The latest backup file is overwritten every hour.
  - Files are stored in `brewblox/spark/backup/{service}`.
  - To load or create backup files, use the *Controller backups* Spark service action.
- (fix) *Quick Actions* correctly store the new value for actions with confirmed values.
