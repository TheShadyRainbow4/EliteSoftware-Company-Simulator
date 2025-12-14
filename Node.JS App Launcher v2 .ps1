<# 
 .SYNOPSIS 
     A PowerShell script to act as a simple launcher and installer for Node.js applications. 
     It provides a GUI to run 'npm install', 'npm run dev', and manage environment files.

 .DESCRIPTION 
     This script is designed to be placed directly within a Node.js project folder. 
     When executed, it checks for Node.js and npm, and if they exist, it displays a GUI. 
     The GUI allows the user to install dependencies, run the development server, and copy a predefined .env.local file.
     It features an integrated console, a marquee progress bar during operations, and a status indicator light (Red/Yellow/Green).
     This version runs npm commands as background jobs, capturing their output directly into the GUI. 
     The console window of the main GUI is minimized on startup. 
     Error messages are still logged to the console, and it will remain open if the GUI is closed due to an error. 

 .CREDITS 
     Created by: Zachary Whiteman & Google Gemini Ai. (8/19/2025 - 3:25 PM EDT) 
 #> 

# Add a function to ensure the console window stays open on crash. 
function global:Wait-For-Key { 
    Write-Host "Press any key to close this window..." 
    $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
} 
# Set a trap to call the function on script termination due to error. 
trap { 
    Write-Error $_.Exception.Message 
    Wait-For-Key 
} 

# Add a function to minimize the console window. 
function Minimize-Console { 
    $code = '[DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);' 
    $minimize = Add-Type -MemberDefinition $code -Name WindowHelper -Namespace ConsoleHelper -PassThru 
    $windowHandle = (Get-Process -Id $PID).MainWindowHandle 
    if ($windowHandle -ne [IntPtr]::Zero) {
        $minimize::ShowWindow($windowHandle, 2) # 2 corresponds to SW_MINIMIZE 
    }
} 

# Add a function to check for Node.js and npm dependencies. 
function Check-Dependencies { 
    try { 
        if (-not (Get-Command node -ErrorAction SilentlyContinue)) { 
            $msg = "Node.js is not found on your system. Please install it from `https://nodejs.org/` to continue." 
            [System.Windows.Forms.MessageBox]::Show($msg, "Dependency Missing", 'OK', 'Error') 
            throw $msg 
        } 
        if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { 
            $msg = "npm is not found on your system. It should be installed with Node.js. Please reinstall Node.js." 
            [System.Windows.Forms.MessageBox]::Show($msg, "Dependency Missing", 'OK', 'Error') 
            throw $msg 
        } 
    } catch { 
        Write-Error "Dependency check failed: $_" 
        exit 
    } 
} 

# --- SCRIPT INITIALIZATION ---

# Minimize the console window on startup. 
Minimize-Console 

# Run the dependency check. 
Check-Dependencies 

# Global variables for managing the background process
$script:currentJob = $null 
$script:serverUrl = $null 
$script:depsInstalled = $false

# Load the required .NET assemblies. 
Add-Type -AssemblyName System.Windows.Forms 
Add-Type -AssemblyName System.Drawing 

# Enable visual styles for system theming as per user preference. 
[System.Windows.Forms.Application]::EnableVisualStyles() 

# --- GUI FORM AND CONTROLS CREATION ---

# Create the main form. 
$form = New-Object System.Windows.Forms.Form 
$form.Text = "Node.js App Launcher" 
$form.Size = New-Object System.Drawing.Size(400, 415) # Increased height for padding
$form.StartPosition = 'CenterScreen' 
$form.FormBorderStyle = 'FixedSingle' # Prevent resizing 
$form.MaximizeBox = $false 
$form.MinimizeBox = $false 

# Create the two-tone header panel. 
$headerPanel = New-Object System.Windows.Forms.Panel 
$headerPanel.Size = New-Object System.Drawing.Size($form.Width, 50) 
$headerPanel.Dock = 'Top' 
$headerPanel.BackColor = [System.Drawing.Color]::FromArgb(255, 12, 100, 160) 
$form.Controls.Add($headerPanel) 

# Add the title label to the header panel. 
$titleLabel = New-Object System.Windows.Forms.Label 
$titleLabel.Text = "Node.Js App Launcher" 
$titleLabel.Font = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold) 
$titleLabel.ForeColor = [System.Drawing.Color]::White 
$titleLabel.Location = New-Object System.Drawing.Point(10, 15) 
$titleLabel.AutoSize = $true 
$headerPanel.Controls.Add($titleLabel) 

# Create the status indicator panel.
$statusIndicator = New-Object System.Windows.Forms.Panel
$statusIndicator.Size = New-Object System.Drawing.Size(20, 20)
$statusIndicator.Location = New-Object System.Drawing.Point(10, 60)
$form.Controls.Add($statusIndicator)

# Create the progress bar.
$progressBar = New-Object System.Windows.Forms.ProgressBar
$progressBar.Location = New-Object System.Drawing.Point(40, 60)
$progressBar.Size = New-Object System.Drawing.Size(334, 20)
$progressBar.Style = 'Marquee'
$progressBar.MarqueeAnimationSpeed = 30
$progressBar.Visible = $false
$form.Controls.Add($progressBar)

# Create a rich text box for output display. 
$outputTextBox = New-Object System.Windows.Forms.RichTextBox 
$outputTextBox.Location = New-Object System.Drawing.Point(10, 90) # Moved down
$outputTextBox.Size = New-Object System.Drawing.Size(364, 150) 
$outputTextBox.Anchor = 'Top, Left, Right, Bottom' 
$outputTextBox.ReadOnly = $true 
$outputTextBox.Multiline = $true 
$outputTextBox.ScrollBars = 'Vertical' 
$outputTextBox.Font = New-Object System.Drawing.Font("Consolas", 9)
$outputTextBox.BackColor = [System.Drawing.Color]::Black
$outputTextBox.ForeColor = [System.Drawing.Color]::White
$form.Controls.Add($outputTextBox) 

# Create the "npm install" button. 
$installButton = New-Object System.Windows.Forms.Button 
$installButton.Text = "Run npm install" 
$installButton.Location = New-Object System.Drawing.Point(10, 250)
$installButton.Size = New-Object System.Drawing.Size(115, 40) 
$installButton.Font = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Bold) 
$form.Controls.Add($installButton) 

# Create the "npm run dev" button. 
$devButton = New-Object System.Windows.Forms.Button 
$devButton.Text = "Run npm run dev" 
$devButton.Location = New-Object System.Drawing.Point(135, 250)
$devButton.Size = New-Object System.Drawing.Size(120, 40) 
$devButton.Font = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Bold) 
$form.Controls.Add($devButton) 

# Create the close button. 
$closeButton = New-Object System.Windows.Forms.Button 
$closeButton.Text = "Close" 
$closeButton.Location = New-Object System.Drawing.Point(265, 250)
$closeButton.Size = New-Object System.Drawing.Size(109, 40) 
$closeButton.Font = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Bold) 
$form.Controls.Add($closeButton) 

# Create the "Stop Server" button. 
$stopButton = New-Object System.Windows.Forms.Button 
$stopButton.Text = "Stop Server" 
$stopButton.Location = New-Object System.Drawing.Point(10, 295)
$stopButton.Size = New-Object System.Drawing.Size(245, 40)
$stopButton.Font = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Bold) 
$stopButton.Enabled = $false 
$form.Controls.Add($stopButton) 
# Store the default button color for later use
$defaultButtonColor = $stopButton.BackColor
$defaultButtonForeColor = $stopButton.ForeColor

# Create the "Open Browser" button. 
$browserButton = New-Object System.Windows.Forms.Button 
$browserButton.Text = "Open Browser" 
$browserButton.Location = New-Object System.Drawing.Point(265, 295)
$browserButton.Size = New-Object System.Drawing.Size(109, 40) 
$browserButton.Font = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Bold) 
$browserButton.Enabled = $false 
$form.Controls.Add($browserButton) 

# Create the "Setup .env" button.
$envButton = New-Object System.Windows.Forms.Button
$envButton.Text = "Setup .env"
$envButton.Location = New-Object System.Drawing.Point(10, 340)
$envButton.Size = New-Object System.Drawing.Size(364, 25)
$envButton.Font = New-Object System.Drawing.Font("Arial", 8, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($envButton)

# --- STATUS AND JOB HANDLING ---

# Function to update the status indicator color
function Update-StatusIndicator($status) {
    switch ($status) {
        'running' { 
            $statusIndicator.BackColor = [System.Drawing.Color]::LimeGreen
            $stopButton.BackColor = [System.Drawing.Color]::Crimson
            $stopButton.ForeColor = [System.Drawing.Color]::White
        }
        'installed' { 
            $statusIndicator.BackColor = [System.Drawing.Color]::Yellow 
            $stopButton.BackColor = $defaultButtonColor
            $stopButton.ForeColor = $defaultButtonForeColor
        }
        'stopped' { 
            $statusIndicator.BackColor = [System.Drawing.Color]::Red 
            $stopButton.BackColor = $defaultButtonColor
            $stopButton.ForeColor = $defaultButtonForeColor
        }
        default { 
            $statusIndicator.BackColor = [System.Drawing.Color]::Gray 
        }
    }
}

# This timer will periodically check the status of the running job
$jobTimer = New-Object System.Windows.Forms.Timer 
$jobTimer.Interval = 250 # Check every 250 milliseconds

$jobTimer.Add_Tick({ 
    if ($null -eq $script:currentJob) {
        $jobTimer.Stop()
        return
    }

    # Receive any new output from the job's streams
    $output = Receive-Job -Job $script:currentJob
    if ($output) {
        $outputString = $output | Out-String
        $outputTextBox.AppendText($outputString)
        $outputTextBox.ScrollToCaret()

        # If this is the dev server job, scan for a URL
        if ($script:currentJob.Name -eq "devServer" -and !$script:serverUrl) {
            # Strip ANSI escape codes (color codes) from the output before searching for a URL
            $cleanedOutput = $outputString -replace "\x1B\[[0-?]*[ -/]*[@-~]"
            $match = $cleanedOutput | Select-String -Pattern 'http[s]?://[^\s,]+'
            if ($match) {
                $script:serverUrl = $match.Matches[0].Value
                $outputTextBox.AppendText("`n`n>>> Server URL found: $($script:serverUrl) <<<`n`n")
                $outputTextBox.ScrollToCaret()
                $browserButton.Enabled = $true
                Update-StatusIndicator('running')
            }
        }
    }

    # Check if the job has finished
    if ($script:currentJob.State -in @('Completed', 'Failed', 'Stopped')) {
        $jobTimer.Stop()
        $progressBar.Visible = $false
        
        if ($script:currentJob.State -eq 'Failed') {
            $outputTextBox.AppendText("`n`n>>> Job failed. <<<`n`n")
            $script:depsInstalled = $false
            Update-StatusIndicator('stopped')
        } else {
            $outputTextBox.AppendText("`n`n>>> Job finished. <<<`n`n")
            # If the installer just finished successfully
            if ($script:currentJob.Name -eq "installer") {
                $script:depsInstalled = $true
                Update-StatusIndicator('installed')
            }
        }
        $outputTextBox.ScrollToCaret()

        # Clean up the job and reset the UI
        Remove-Job -Job $script:currentJob
        $script:currentJob = $null
        $installButton.Enabled = $true
        $devButton.Enabled = $true
        $stopButton.Enabled = $false
    }
})

# Function to stop any currently running job
$StopCurrentJob = {
    if ($script:currentJob) {
        $jobTimer.Stop()
        $progressBar.Visible = $false
        Stop-Job -Job $script:currentJob
        # NOTE: Remove-Job does not have a -Force parameter, this was the source of the crash.
        Remove-Job -Job $script:currentJob
        $outputTextBox.AppendText("`n`n>>> Process has been stopped by user. <<<`n`n")
        $outputTextBox.ScrollToCaret()

        # Reset state
        $script:currentJob = $null
        $script:serverUrl = $null
        $stopButton.Enabled = $false
        $browserButton.Enabled = $false
        $installButton.Enabled = $true
        $devButton.Enabled = $true
        
        # Update status based on whether deps were installed
        if ($script:depsInstalled) {
            Update-StatusIndicator('installed')
        } else {
            Update-StatusIndicator('stopped')
        }
    }
}

# --- BUTTON CLICK EVENT HANDLERS ---

$installButton.Add_Click({ 
    $installButton.Enabled = $false 
    $devButton.Enabled = $false 
    $stopButton.Enabled = $false
    $browserButton.Enabled = $false
    $outputTextBox.Text = "Running 'npm install'...`n"
    $progressBar.Visible = $true
    
    # Start 'npm install' as a background job
    $script:currentJob = Start-Job -ScriptBlock { npm install 2>&1 } -Name "installer"
    $jobTimer.Start()
}) 

$devButton.Add_Click({ 
    if ($script:currentJob) { 
        [System.Windows.Forms.MessageBox]::Show("Another process is already running. Please stop it first.", "Warning", 'OK', 'Warning') 
        return 
    } 
    
    $installButton.Enabled = $false 
    $devButton.Enabled = $false 
    $stopButton.Enabled = $true
    $browserButton.Enabled = $false
    $script:serverUrl = $null
    $outputTextBox.Text = "Starting dev server...`n"
    $progressBar.Visible = $true
    
    # Start 'npm run dev' as a background job.
    $script:currentJob = Start-Job -ScriptBlock { npm run dev 2>&1 } -Name "devServer"
    $jobTimer.Start()
}) 

$browserButton.Add_Click({ 
    if ($script:serverUrl) { 
        try {
            Start-Process $script:serverUrl 
        } catch {
            [System.Windows.Forms.MessageBox]::Show("Failed to open URL: $($script:serverUrl)`n`nError: $($_.Exception.Message)", "Error", 'OK', 'Error')
        }
    } 
}) 

$stopButton.Add_Click({ 
    & $StopCurrentJob
}) 

$envButton.Add_Click({
    $sourceEnvPath = "H:\Program Files\New+\.env.local"
    $destEnvPath = Join-Path $PSScriptRoot ".env.local"

    if (-not (Test-Path $sourceEnvPath)) {
        [System.Windows.Forms.MessageBox]::Show("Source file not found at:`n$sourceEnvPath", "Error", 'OK', 'Error')
        return
    }

    try {
        Copy-Item -Path $sourceEnvPath -Destination $destEnvPath -Force -ErrorAction Stop
        $outputTextBox.AppendText("`n>>> Successfully copied .env.local file. <<<`n")
        $outputTextBox.ScrollToCaret()
    } catch {
        [System.Windows.Forms.MessageBox]::Show("Failed to copy file.`n`nError: $($_.Exception.Message)", "Error", 'OK', 'Error')
    }
})

$closeButton.Add_Click({ 
    & $StopCurrentJob
    $form.Close() 
}) 

# Add a handler for when the form is closed via the 'X' button
$form.Add_FormClosing({
    & $StopCurrentJob
})

# --- SHOW THE GUI ---
# Set initial status indicator state
Update-StatusIndicator('stopped')

# This line will block the script until the form is closed.
[void]$form.ShowDialog()
