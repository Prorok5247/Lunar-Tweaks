import fs from 'fs';
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
        fs.mkdirSync(LTFolderLocation);
        fs.mkdirSync(LTTempFolderLocation)
        resolve();
      } else if(!fs.existsSync(LTTempFolderLocation)) {
        fs.mkdirSync(LTTempFolderLocation)
        resolve();
      } else resolve();
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
    id: "d74e221",
    fullId: "d74e2214b495c083b9ba934601ef75f489176e57",
    filePath: "lunar\\aX\\IIlllIlIlIIIlIIIlIlIlIIIl_1.lclass"
  },
  paths: {
    pinnedServers: {
      realFileName: "lIlIllIIlIIIIlIIlIIllllII.lclass",
      fileName: "pinnedServers.lclass",
      path: "lunar/cX"
    }
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
      const patch = mappings.paths[patchName];
      const jarFile = new AdmZip(`${currentFolderPath}\\currentJarFile.jar`);
      let fileEntry;
      jarFile.getEntries().forEach(entry => {
        if(entry.entryName === `${patch.path}/${patch.realFileName}`) {
          fileEntry = entry;
        }
      });
      jarFile.deleteFile(fileEntry);
      // jarFile.addLocalFile(`${LTFolderLocation}\\lclasses\\${patch.fileName}`, `${patch.path}\\${patch.realFileName}`);
      jarFile.addLocalFile(`${LTFolderLocation}\\lclasses\\${patch.fileName}`, patch.path, patch.realFileName);
      jarFile.writeZip(`${currentFolderPath}\\currentJarFile.jar`, (err) => {
        if (err) throw err;
        resolve();
      });
    }, 1500);
  });
}

export async function saveBuild(currentFolderPath, selectedPatches) {
  return new Promise((resolve) => {
    // Applying patches
    selectedPatches.forEach(async (patchName) => {
      await patch(currentFolderPath, patchName);
    });

    // Saving file
    setTimeout(() => {
      let filePath = electron.remote.dialog.showSaveDialogSync({
        title: "Save your custom Lunar build",
        defaultPath: `${process.env.USERPROFILE}\\.lunarclient\\offline\\1.8\\lunar-prod-optifine.jar`,
        buttonLabel: "Save build",
        filters: [{ name: "JAR File", extensions: [ "jar" ] }],
        properties: [ "showHiddenFiles", "dontAddToRecent" ]
      });
      fs.copyFileSync(`${currentFolderPath}\\currentJarFile.jar`, filePath);
      resolve();
    }, 15000);
  });
}