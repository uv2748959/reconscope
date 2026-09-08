# ReconScope

ReconScope is a web application created for the Reconnaissance phase of an ethical hacking project. The application provides a structured environment for documenting information gathered during reconnaissance while keeping the process organized and within a defined scope.

The project was created as an educational tool to demonstrate how information collected during reconnaissance can be recorded, categorized, reviewed, and turned into a report.

## Live Web App

ReconScope can be accessed here:

https://uv2748959.github.io/reconscope/

## What It Does

ReconScope helps organize information collected during the reconnaissance phase of a security assessment.

The application allows a user to:

- Create and manage reconnaissance projects
- Define the scope of an assessment
- Record domains, subdomains, IP addresses, and other discovered assets
- Document reconnaissance observations and evidence
- Categorize collected information
- Distinguish between confirmed and unverified information
- Record sources and collection methods
- Review the reconnaissance footprint
- Generate a structured reconnaissance report
- Add limitations and recommendations to the report
- Export and import project data using JSON
- Print the completed report
- Review information about passive and active reconnaissance
- Identify the boundary between reconnaissance and scanning

ReconScope also includes a fictional demonstration project that can be loaded directly from the application.

## How It Works

ReconScope is a client-side React application. Project information is stored locally in the user's browser rather than being sent to an external server.

A reconnaissance project begins by defining the target and authorized scope. Information collected during reconnaissance can then be entered into the Evidence Log.

The application uses the recorded evidence to help organize discovered assets and build a reconnaissance footprint. The collected information is then used to generate a report containing the project's scope, methods, assets, evidence, sources, limitations, and recommendations.

ReconScope is intended for educational use and for documenting reconnaissance performed against systems that the user is authorized to assess.

## How to Install

The hosted version of ReconScope does not require installation. It can be opened directly using the Live Web App link above.

To run ReconScope locally, the following software is required:

- [Node.js](https://nodejs.org/)
- npm
- Git

### Local Installation

1. Clone the GitHub repository:

```bash
git clone https://github.com/uv2748959/reconscope.git
```

2. Navigate into the project directory:

```bash
cd reconscope
```

3. Install the required dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Vite will display a local address, typically:

```text
http://localhost:5173/
```

6. Open the displayed address in a web browser.

To create a production build, run:

```bash
npm run build
```

## Step-by-Step Instructions

### 1. Open ReconScope

Open the hosted application or start the application locally.

### 2. Create a Project

Create a new reconnaissance project and enter the information requested by the application.

The project provides a workspace for keeping reconnaissance information separated and organized.

### 3. Define the Scope

Specify the systems that are authorized for the reconnaissance project.

Clearly defining scope is important because information may be discovered that is related to the target but is not authorized for further investigation.

### 4. Record Reconnaissance Evidence

Use the Evidence Log to record information discovered during reconnaissance.

Evidence can include information such as:

- Domains
- Subdomains
- IP addresses
- Technologies
- Publicly available organizational information
- Other observations relevant to the reconnaissance phase

ReconScope allows observations to be categorized and their verification status recorded.

### 5. Review Discovered Assets

Review the assets identified from the reconnaissance evidence.

This provides a summarized view of the target's known footprint based on the information entered into the project.

### 6. Review the Methodology

Open the Methodology section to review the differences between passive and active reconnaissance and the boundary between reconnaissance and scanning.

### 7. Generate the Report

Open the Report section to review the information collected during the project.

The report organizes information including:

- Scope
- Reconnaissance methods
- Discovered footprint
- Evidence
- Sources
- Limitations
- Recommendations

Limitations and recommendations can be edited before the report is finalized.

### 8. Export or Print the Project

Project information can be exported as JSON for later use.

The report can also be printed using the browser's printing functionality.

## Fictional Demo

ReconScope includes a built-in fictional demonstration project called **Northstar Bicycle Repair**.

Selecting **Load fictional demo** populates the application with sample reconnaissance information, including:

- A fictional root domain
- Multiple subdomains
- An authorized IP range
- An example of an out-of-scope IP address
- Technology observations
- Fictional staff information
- Reconnaissance observations across multiple categories

The demo allows the features of ReconScope to be explored without performing reconnaissance against a real organization.

All organizations, people, assets, and observations contained in the demonstration data are fictional and are included for educational purposes.

## Reconnaissance Methodology

ReconScope distinguishes between passive and active reconnaissance.

**Passive reconnaissance** involves gathering information without directly interacting with the target systems. Examples may include reviewing publicly available information and other open sources.

**Active reconnaissance** involves direct interaction with a target and therefore requires careful attention to authorization and scope.

ReconScope also emphasizes the boundary between reconnaissance and the next phase of an assessment, **Scanning**. The application is focused on organizing and documenting reconnaissance rather than performing vulnerability scanning or exploitation.

## Technologies Used

ReconScope was built using:

- React
- TypeScript
- Vite
- React Router
- HTML
- CSS
- Git
- GitHub
- GitHub Pages

## Data Storage

ReconScope stores project information locally in the user's browser. No backend server or external database is required.

Because the data is stored locally, users can export their project data as JSON if they want to create a backup or transfer it to another browser.

## Testing

The project includes automated tests for application functionality.

A production build can be verified with:

```bash
npm run build
```

## Ethical Use

ReconScope was created for educational purposes.

Reconnaissance and other cybersecurity activities should only be performed against systems that you own or have explicit authorization to assess. Users are responsible for remaining within the authorized scope of an assessment.

## Author

**Ulises Valdivia**

Cybersecurity Student
