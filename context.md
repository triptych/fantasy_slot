# PuterJS - Comprehensive Documentation

## What is PuterJS?

**PuterJS** is a powerful JavaScript library that provides **serverless auth, cloud, and AI services directly to browser-side JavaScript**. It enables frontend developers to instantly use file storage, databases, and AI models like GPT-4 and DALL-E without requiring any backend code.

## Key Features & Modules

### 1. **Getting Started**
- **Simple Installation**: Just add one script tag to your HTML:
```html
<script src="https://js.puter.com/v2/"></script>
```
- No dependencies, server setup, API keys, or additional configuration required

### 2. **Core Modules**

#### **Apps Module** (`Puter.Apps`)
- **create()** - Create new applications
- **list()** - List all applications
- **get()** - Get application details
- **update()** - Update application properties
- **delete()** - Delete applications

#### **Hosting Module** (`Puter.Hosting`)
- **create()** - Create hosting instances/websites
- **list()** - List hosting deployments
- **get()** - Get hosting details
- **update()** - Update hosting configurations
- **delete()** - Delete hosting instances

#### **Key-Value Store** (`Puter.KV`)
- **set()** - Store key-value pairs
- **get()** - Retrieve values by key
- **list()** - List all keys
- **incr()** - Increment numeric values
- **decr()** - Decrement numeric values
- **del()** - Delete key-value pairs
- **flush()** - Clear all data

#### **UI Module** (`Puter.UI`)
- **authenticateWithPuter()** - User authentication
- **alert()** - Show alert dialogs
- **prompt()** - Show input prompts
- **createWindow()** - Create new windows
- **launchApp()** - Launch other applications
- **onLaunchedWithItems()** - Handle app launch with files
- **showOpenFilePicker()** - File selection dialogs
- **showSaveFilePicker()** - Save file dialogs
- **showDirectoryPicker()** - Directory selection
- **showColorPicker()** - Color picker
- **showFontPicker()** - Font picker

#### **Authentication** (`Puter.Auth`)
- **signIn()** - User sign-in
- **signOut()** - User sign-out
- **isSignedIn()** - Check authentication status
- **getUser()** - Get current user info

#### **File System** (`Puter.FS`)
- **write()** - Write files
- **read()** - Read files
- **stat()** - Get file information
- **mkdir()** - Create directories
- **delete()** - Delete files/directories
- **rename()** - Rename files/directories
- **upload()** - Upload files

#### **Networking** (`Puter.Net`)
- **fetch()** - Make HTTP requests
- **Socket** - Network socket communication
- **TLSSocket** - Secure socket communication

#### **Utilities** (`Puter.Utils`)
- **print()** - Output to console/display
- **randName()** - Generate random names
- **appID** - Current application ID
- **env** - Environment variables

## Practical Examples

### Basic Usage
```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.print("Hello, world!");
    </script>
</body>
</html>
```

### Creating and Hosting a Website
```html
<script>
(async () => {
    // Create a directory
    let dirName = puter.randName();
    await puter.fs.mkdir(dirName);

    // Create index.html
    await puter.fs.write(`${dirName}/index.html`, '<h1>Hello, world!</h1>');

    // Host the website
    let subdomain = puter.randName();
    const site = await puter.hosting.create(subdomain, dirName);

    puter.print(`Website hosted at: https://${site.subdomain}.puter.site`);
})();
</script>
```

### Making HTTP Requests
```html
<script>
(async () => {
    const request = await puter.net.fetch("https://example.com");
    const body = await request.text();
    puter.print(body, { code: true });
})();
</script>
```

### File Operations
```html
<script>
(async () => {
    // Create a file
    await puter.fs.write('hello.txt', 'Hello, world!');
    puter.print('hello.txt created<br>');

    // Get file information
    const file = await puter.fs.stat('hello.txt');
    puter.print(`File name: ${file.name}<br>`);
    puter.print(`File path: ${file.path}<br>`);
    puter.print(`File size: ${file.size}<br>`);
    puter.print(`Created: ${file.created}<br>`);
})();
</script>
```

### App Management
```html
<script>
(async () => {
    // Generate random app names
    let appName_1 = puter.randName();
    let appName_2 = puter.randName();
    let appName_3 = puter.randName();

    // Create apps
    await puter.apps.create(appName_1, 'https://example.com');
    await puter.apps.create(appName_2, 'https://example.com');
    await puter.apps.create(appName_3, 'https://example.com');

    // List all apps
    let apps = await puter.apps.list();
    puter.print(JSON.stringify(apps.map(app => app.name)));

    // Cleanup - delete created apps
    await puter.apps.delete(appName_1);
    await puter.apps.delete(appName_2);
    await puter.apps.delete(appName_3);
})();
</script>
```

### Hosting Management
```html
<script>
(async () => {
    // Generate random subdomain names
    let site_1 = puter.randName();
    let site_2 = puter.randName();
    let site_3 = puter.randName();

    // Create websites
    await puter.hosting.create(site_1);
    await puter.hosting.create(site_2);
    await puter.hosting.create(site_3);

    // List all sites
    let sites = await puter.hosting.list();
    puter.print(sites.map(site => site.subdomain));

    // Cleanup
    await puter.hosting.delete(site_1);
    await puter.hosting.delete(site_2);
    await puter.hosting.delete(site_3);
})();
</script>
```

### UI Interactions
```html
<script>
// Handle app launch with items
puter.ui.onLaunchedWithItems(function(items){
    document.body.innerHTML = JSON.stringify(items);
});

// Launch another app
puter.ui.launchApp('editor');

// Check if launched with items
if (puter.ui.wasLaunchedWithItems()) {
    // Handle accordingly
}
</script>
```

## API Reference Details

### Apps Module API
```javascript
// Create application
puter.apps.create(name, url)

// List applications with options
puter.apps.list({
    stats_period: 'today', // 'yesterday', '7d', '30d', etc.
    icon_size: 64 // 16, 32, 64, 128, 256, 512
})

// Get specific app
puter.apps.get(appId)

// Update app
puter.apps.update(appId, properties)

// Delete app
puter.apps.delete(appId)
```

### Hosting Module API
```javascript
// Create hosting
puter.hosting.create(subdomain, dirPath)

// Get hosting details
puter.hosting.get(subdomain)

// List all hosting
puter.hosting.list()

// Update hosting
puter.hosting.update(subdomain, properties)

// Delete hosting
puter.hosting.delete(subdomain)
```

### UI Module API
```javascript
// Launch app with parameters
puter.ui.launchApp()
puter.ui.launchApp(appName)
puter.ui.launchApp(appName, args)
puter.ui.launchApp(args)

// Handle launched items
puter.ui.onLaunchedWithItems(handler)

// Check launch status
puter.ui.wasLaunchedWithItems() // returns boolean

// File pickers
puter.ui.showOpenFilePicker()
puter.ui.showSaveFilePicker()
puter.ui.showDirectoryPicker()

// Other UI elements
puter.ui.showColorPicker()
puter.ui.showFontPicker()
puter.ui.alert(message)
puter.ui.prompt(message)
```

## Core Objects

- **AppConnection** - Represents connections between applications
- **App** - Application object with metadata
- **FSItem** - File system item (file or directory)
- **Subdomain** - Hosting subdomain object

## Key Benefits

1. **No Backend Required** - Everything runs in the browser
2. **Instant Setup** - Single script tag installation
3. **Comprehensive APIs** - File storage, hosting, authentication, UI components
4. **AI Integration** - Built-in access to AI models
5. **Cloud Services** - Serverless architecture
6. **Cross-Platform** - Works in any modern browser
7. **Real-time Capabilities** - Socket communication support
8. **User Management** - Built-in authentication system
9. **File Management** - Complete cloud file system
10. **Hosting Platform** - Deploy websites instantly

## Use Cases

- **Rapid Prototyping** - Quick app development without infrastructure
- **Educational Projects** - Teaching web development with cloud features
- **Small to Medium Applications** - Full-featured apps without backend complexity
- **Portfolio Websites** - Easy hosting and management
- **File Sharing Applications** - Built-in cloud storage
- **Collaborative Tools** - Real-time features with authentication
- **AI-Powered Applications** - Direct access to AI models
- **Cross-Platform Tools** - Browser-based applications

## Trust Score & Documentation Coverage

- **Trust Score**: 8/10 (High reliability)
- **Code Snippets Available**: 3,287 examples
- **Documentation Source**: https://docs.puter.com/

PuterJS essentially democratizes cloud application development by making enterprise-level features accessible through simple JavaScript APIs that run entirely in the browser, eliminating the need for traditional backend infrastructure while providing powerful cloud capabilities.
