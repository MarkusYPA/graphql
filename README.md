# graphql

A web-based profile page powered by GraphQL that displays personal school statistics using authenticated data from the [grit:lab GraphQL API](https://01.gritlab.ax/api/graphql-engine/v1/graphql).

## 📌 Objectives

The goal of this project is to learn and work with the GraphQL query language by creating a personal profile UI, complete with statistics and visualizations.

- 🔒 Includes a working **login system** using Basic Authentication to retrieve a JWT token
- 📊 Displays **data points** about the authenticated user
- 📈 Contains **two SVG-based statistical graphs** using real data
- ☁️ Hosted online (GitHub Pages)


## ✨ Features

- **Login Page**  
  Authenticate using either a **username** or **email**, combined with a password.  
  If login is successful, a JWT is stored and used for querying the GraphQL API.

- **Profile Page**  
  Displays personal data from the GraphQL endpoint.  
  Includes:
  - Basic user info
  - XP summary and projects completed
  - Audit stats

- **SVG Graphs**  
  Two custom-built graphs using SVG elements:
  - XP progression over time
  - Acquired skills

- **JWT Handling**
  - JWTs are stored in `localStorage`
  - Automatically validated on page load via a lightweight GraphQL query
  - Protected queries include the token via Bearer Authentication
  - **logout** button clears stored tokens


## 🚀 Getting Started

- Navigate to https://markusypa.github.io/graphql/

Or
- Clone the repository or download the files  
- Serve `index.html` with a static file host (e.g. Pyhton or VS Code Live Server)

Then  
- Log in with your GritLab credentials  
- Explore your personal data and stats


## 🛡️ Authentication Details

- JWTs are retrieved from:  
  `https://01.gritlab.ax/api/auth/signin`
- Auth method: **Basic Auth** (base64-encoded `username:password` or `email:password`)
- GraphQL queries use Bearer token headers:  

## 🧑‍💻️ Author

- [Markus Amberla](https://github.com/MarkusYPA)