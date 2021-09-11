import fs from 'fs';
import fse from 'fs-extra';
import process from 'process';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';
import electron from 'electron';

const LTFolderLocation = `${process.env.LOCALAPPDATA}\\LunarTweaks`;
const LTTempFolderLocation = `${LTFolderLocation}\\Temp`;

export async function checkLTFolder() {
  return new Promise((resolve) => {
    setTimeout(() => {
      if(!fs.existsSync(LTFolderLocation)) {
        fse.copySync(`${__dirname}\\..\\template`, LTFolderLocation);
        resolve();
      } else resolve();
    }, 500);
  });
}

export async function clearCache(currentFolderPath) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(currentFolderPath);
      fs.rmdirSync(currentFolderPath, { recursive: true, force: true });
      resolve();
    }, 500);
  });
}

export async function copyJarFileToTemp(filePath) {
  return new Promise((resolve) => {
    const date = new Date();
    const currentFolder = `${LTTempFolderLocation}\\${date.getTime().toString()}`
    fs.mkdirSync(currentFolder);
    setTimeout(() => {
      fs.copyFileSync(filePath, `${currentFolder}\\currentJarFile.jar`);
      resolve(currentFolder);
    }, 1000);
  });
}

export async function extract(currentFolderPath) {
  return new Promise((resolve) => {
    setTimeout(() => {
      execSync(`${LTFolderLocation}\\7z.exe x -aou -o${currentFolderPath}\\extractedJarFile ${currentFolderPath}\\currentJarFile.jar`);
      resolve();
    }, 1000);
  });
}

export async function isLunar(currentFolderPath) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const files = fs.readdirSync(`${currentFolderPath}\\extractedJarFile`);
      const defaultFiles = [ "assets", "com", "Config.lclass", "javax", "lunar", "mchorse", "net", "optifinePatches.cfg", "org", "patch", "thirdPartyMods.txt" ];
      files.forEach(file => {
        if(defaultFiles.includes(file)) {
          defaultFiles.splice(defaultFiles.indexOf(file), 1);
        }
      });
      if(defaultFiles.length !== 0) {
        resolve(false);
      }
      resolve(true);
    }, 500);
  });
}

const mappings = {
  commit: {
    id: "6b9c0d7",
    fullId: "6b9c0d7b436f8e85c931cdc93bb380fd518f0047",
    filePath: "lunar\\aX\\lIlIllllIlIlIIllIlllIlIII_1.lclass"
  },
  paths: {
    pinnedServers: [
      {
        realFileName: "IIlllIllIIlIlIlIllIIllIll.lclass",
        fileName: "pinnedServers.lclass",
        path: "lunar/cX"
      }
    ],
    freelook: [
      {
        realFileName: "lIlIllllIlIlIIllIlllIlIII.lclass",
        fileName: "bT freelook.lclass",
        path: "lunar/bT"
      },
      {
        realFileName: "IllllIIlIIIllIlllIlllIllI.lclass",
        fileName: "cR freelook.lclass",
        path: "lunar/cR"
      },
      {
        realFileName: "lIlIIllIIIIIIlllllIIllIIl.lclass",
        fileName: "dH freelook.lclass",
        path: "lunar/dH"
      },
      {
        realFileName: "llllIIllllllIlIIlIlIIIllI.lclass",
        fileName: "fy freelook.lclass",
        path: "lunar/fy"
      }
    ],
    modspacket: [
      {
        realFileName: "LCPacket.lclass",
        fileName: "LCPacket.lclass",
        path: "com/lunarclient/bukkitapi/nethandler/"
      }
    ]
  }
}

export async function findCommitId(currentFolderPath) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const file = fs.readFileSync(`${currentFolderPath}\\extractedJarFile\\${mappings.commit.filePath}`, { encoding: 'hex' });
      if(file.includes(asciiToHex(mappings.commit.id)) && file.includes(asciiToHex(mappings.commit.fullId))) {
        resolve(mappings.commit.id);
      } else resolve(null);
    }, 1000);
  });
}

function asciiToHex(str) {
	var arr1 = [];
	for (var n = 0, l = str.length; n < l; n ++) {
		var hex = Number(str.charCodeAt(n)).toString(16);
		arr1.push(hex);
	}
	return arr1.join('');
}

export async function patch(currentFolderPath, patchName) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const patchs = mappings.paths[patchName];
      const jarFile = new AdmZip(`${currentFolderPath}\\currentJarFile.jar`);
      for (const patchIndex in patchs) {
        const patch = patchs[patchIndex];
        let fileEntry;
        jarFile.getEntries().forEach(entry => {
          if(entry.entryName === `${patch.path}/${patch.realFileName}`) {
            fileEntry = entry;
          }
        });
        jarFile.deleteFile(fileEntry);
        jarFile.addLocalFile(`${LTFolderLocation}\\lclasses\\${patch.fileName}`, patch.path, patch.realFileName);
      }
      jarFile.writeZip(`${currentFolderPath}\\currentJarFile.jar`, (err) => {
        if (err) throw err;
        resolve();
      });
    }, 1500);
  });
}

export async function saveBuild(currentFolderPath, selectedPatches) {
  // Applying patches
  for (const patchIndex in selectedPatches) {
    const patchName = selectedPatches[patchIndex];
    await patch(currentFolderPath, patchName);
  }

  return new Promise((resolve) => {
    // Saving file
    setTimeout(() => {
      let filePath = electron.remote.dialog.showSaveDialogSync({
        title: "Save your custom Lunar build",
        defaultPath: `${process.env.USERPROFILE}\\.lunarclient\\offline\\1.8\\lunar-prod-optifine.jar`,
        buttonLabel: "Save build",
        filters: [{ name: "JAR File", extensions: [ "jar" ] }],
        properties: [ "showHiddenFiles", "dontAddToRecent" ]
      });
      if(!filePath) {
        resolve(false);
        return;
      }
      fs.copyFileSync(`${currentFolderPath}\\currentJarFile.jar`, filePath);
      resolve(filePath);
    }, 1500);
  });
}
