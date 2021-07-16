# nodejs
$url = "https://nodejs.org/dist/latest-v15.x/node-v15.14.0-x64.msi"

# activate / desactivate any install
$install_node = $TRUE

write-host "`n----------------------------"
write-host " system requirements checking  "
write-host "----------------------------`n"


### nodejs version check

if (Get-Command node -errorAction SilentlyContinue) {
    $current_version = (node -v)
}
 
if ($current_version) {
    write-host "[NODE] nodejs $current_version already installed"
    $confirmation = read-host "Are you sure you want to replace this version ? [y/N]"
    if ($confirmation -ne "y") {
        $install_node = $FALSE
    }
}


if ($install_node) {
    write-host "`n----------------------------"
    write-host "  nodejs msi file retrieving  "
    write-host "----------------------------`n"

    $filename = "node.msi"
    $node_msi = "$PSScriptRoot\$filename"
    
    $download_node = $TRUE

    if (Test-Path $node_msi) {
        $confirmation = read-host "Local $filename file detected. Do you want to use it ? [Y/n]"
        if ($confirmation -eq "n") {
            $download_node = $FALSE
        }
    }

    if ($download_node) {
        write-host "[NODE] downloading nodejs install"
        write-host "url : $url"
        $start_time = Get-Date
        $wc = New-Object System.Net.WebClient
        $wc.DownloadFile($url, $node_msi)
        write-Output "$filename downloaded"
        write-Output "Time taken: $((Get-Date).Subtract($start_time).Seconds) second(s)"
    } else {
        write-host "using the existing node.msi file"
    }

    ### nodejs install

    write-host "`n----------------------------"
    write-host " nodejs installation  "
    write-host "----------------------------`n"

    write-host "[NODE] running $node_msi"
    Start-Process $node_msi -Wait
    
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User") 
    
} else {
    write-host "Proceeding with the previously installed nodejs version ..."
}

### npm packages install

write-host "`n----------------------------"
write-host " npm packages installation  "
write-host "----------------------------`n"

npm install

write-host "`n----------------------------"
write-host " Build app  "
write-host "----------------------------`n"

npm run build

### clean

if ($node_msi -and (Test-Path $node_msi)) {
        rm $node_msi
}

write-host "Done !"
