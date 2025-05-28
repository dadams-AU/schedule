-- Table: Projects
CREATE TABLE Projects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT current_timestamp,
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT current_timestamp
);

-- Table: Unavailability
CREATE TABLE Unavailability (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES Projects(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    unavailable_date DATE NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT current_timestamp,
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT current_timestamp,
    CONSTRAINT unique_project_user_date UNIQUE (project_id, user_name, unavailable_date)
);

-- Optional: Trigger to update 'updatedAt' timestamp on row update for Projects table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = current_timestamp;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON Projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Optional: Trigger to update 'updatedAt' timestamp on row update for Unavailability table
CREATE TRIGGER update_unavailability_updated_at
BEFORE UPDATE ON Unavailability
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
