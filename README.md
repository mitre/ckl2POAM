# ckl2POAM
Tool for converting Checklist -> POA&M.

## How to install:
1. Clone the repository: `git clone https://github.com/mitre/ckl2POAM`
2. Install dependencies: `yarn install`
3. Build the app: `yarn run build`

## How to update:

### Option 1 (Using git)
1. Ensure you are in the folder containing ckl2POAM
2. Stash any existing input/outputs `git stash --include-untracked`
3. Update the repository: `git fetch`
4. Pull the latest changes `git pull`
5. Restore your files `git stash pop`
6. Install dependencies: `yarn install`
7. Build the app: `yarn run build`

### Option 2 (Using Download as Zip on Windows)
1. Delete your existing ckl2POAM folder
2. Download the most recent version: https://github.com/mitre/ckl2POAM/archive/refs/heads/main.zip
3. Open `install.ps1`, decline NodeJS and NPM install if it is already installed

### Option 3 (Using Download as Zip on MacOS/Linux)
1. Delete your existing ckl2POAM folder
2. Download the most recent version: https://github.com/mitre/ckl2POAM/archive/refs/heads/main.zip
3. Enter the ckl2POAM folder using the terminal
4. Install dependencies: `yarn install`
5. Build the app: `yarn run build`

## How to use:
1. Put your `.ckl` checklist files into `input/`
2. Run the script: `yarn run start`
3. Converted spreadsheets will show up in `output/`

## Contributing, Issues and Support

### Contributing

Please feel free to look through our issues, make a fork and submit _PRs_ and improvements. We love hearing from our end-users and the community and will be happy to engage with you on suggestions, updates, fixes or new capabilities.

### Issues and Support

Please feel free to contact us by **opening an issue** on the issue board, or, at [saf@groups.mitre.org](mailto:saf@groups.mitre.org) should you have any suggestions, questions or issues. If you have more general questions about the use of our software or other concerns, please contact us at [opensource@mitre.org](mailto:opensource@mitre.org).

### NOTICE

© 2019-2021 The MITRE Corporation.

Approved for Public Release; Distribution Unlimited. Case Number 18-3678.

### NOTICE

MITRE hereby grants express written permission to use, reproduce, distribute, modify, and otherwise leverage this software to the extent permitted by the licensed terms provided in the LICENSE.md file included with this project.

### NOTICE

This software was produced for the U. S. Government under Contract Number HHSM-500-2012-00008I, and is subject to Federal Acquisition Regulation Clause 52.227-14, Rights in Data-General.

No other use other than that granted to the U. S. Government, or to those acting on behalf of the U. S. Government under that Clause is authorized without the express written permission of The MITRE Corporation.

For further information, please contact The MITRE Corporation, Contracts Management Office, 7515 Colshire Drive, McLean, VA 22102-7539, (703) 983-6000.
