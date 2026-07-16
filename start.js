// @mix
console.clear()
if (!$floaty.checkPermission()) {
    $floaty.requestPermission();
}
const version = 1003;
const myPackageName = context.getPackageName();
const isRoot = $shell.checkAccess("root");
const storage = storages.create(myPackageName);
const selecttName = storage.get('name', '')

storage.put('v', '1002');
importClass("android.content.pm.PackageManager");
importClass("android.provider.Settings");
importClass('android.content.IntentFilter')
importClass('android.net.VpnService');
importClass("android.os.Handler");
importClass("android.database.ContentObserver");
importClass("android.content.pm.PackageManager");
importClass("android.provider.Settings");

try {
    //     let file = `/data/user/0/${myPackageName}/files/start_app.sh`
    //     shell(`ps -ef | grep ${file}| grep -v grep | awk '{print $2}' | xargs kill -9`, true);
    //     files.write(file, `#!/system/bin/sh
    // # 定义目标 Activity
    // target_activity="com.jwn.bundle10/com.stardust.autojs.inrt.SplashActivity"

    // # 进入无限循环
    // while true; do
    //     sleep 60
    //     # 使用 dumpsys 命令获取活动信息，并通过 grep 查找目标 Activity
    //     activity_info=$(dumpsys activity activities | grep -E "mResumedActivity|mFocusedActivity|mLastPausedActivity" | grep "$target_activity")

    //     # 判断是否找到目标 Activity
    //     if [ -n "$activity_info" ]; then
    //         echo "$(date '+%Y-%m-%d %H:%M:%S') - $target_activity 已启动"
    //     else
    //         echo "$(date '+%Y-%m-%d %H:%M:%S') - $target_activity 未启动，正在尝试启动..."
    //         am start -n "$target_activity" -f 0x10008000
    //         if [ $? -eq 0 ]; then
    //             echo "$(date '+%Y-%m-%d %H:%M:%S') - $target_activity 启动成功"
    //         else
    //             echo "$(date '+%Y-%m-%d %H:%M:%S') - $target_activity 启动失败"
    //         fi
    //     fi
    //     # 等待 60 秒后再次检查
    // done
    // `)
    //     shell(`chmod +x ${file}`, true);
    //     shell(`sh ${file} >/dev/null 2>&1 &`, true);
} catch (ex) {
    console.error($debug.getStackTrace(ex));
}


if (isRoot) {
    console.info('ROOT', "已开启")
} else {
    console.error('ROOT', "未开启")
}


let isArm32 = android.os.Build.CPU_ABI == 'armeabi-v7a'

const bundles = {
    '全民江湖（娜扎）': 'com.jwn.bundle6',
    '全民江湖（复古）': 'com.jwn.bundle7'
}
function left_menu(txt) {
    return Object.entries(bundles).map(([title, bundle]) => ({
        name: title,
        bundle,
        title: title == txt ? `${title}✔️` : title
    }))
}
ui.layout(
    `<drawer id="drawer">
        <vertical>
            <appbar>
                <toolbar id="toolbar" title="热血壬戌 V${app.versionName} ${selecttName}">
                    <button id="setting" layout_gravity="right" textSize="14sp" text="设置" color="#ffffff" bg="#00000000" />
                </toolbar>
            </appbar>
            <frame>
                <button id="console_clear"text="清空日志"gravity="center"alpha="1"textSize="16sp"
                        layout_gravity="left"padding="0"h="40dp"w="100dp"foreground="?selectableItemBackground"/>
                <button id="reboot"text="重启"gravity="center"alpha="1"textSize="16sp"
                        layout_gravity="right"padding="0"h="40dp"w="100dp"foreground="?selectableItemBackground"/>
                <button id="hotload"text="热更新"gravity="center"alpha="1"textSize="16sp"
                        layout_gravity="center"padding="0"h="40dp"w="140dp"foreground="?selectableItemBackground"/>
                <button id="vpn_auth"text="点击授权vpn"visibility="gone"gravity="center"alpha="1"textSize="16sp"
                        layout_gravity="center"padding="0"h="40dp"w="140dp"foreground="?selectableItemBackground"/>
            </frame>
            <globalconsole id="globalconsole"w="*"h="*"/>
        </vertical>
        <vertical layout_gravity="left" bg="#ffffff" w="280dp">
            <list id="menu">
                <horizontal paddingTop="10dp" paddingLeft="10dp" bg="?selectableItemBackground" w="*">
                    <text h="40dp" textColor="black" textSize="16sp" text="{{this.title}}" layout_gravity="center" />
                </horizontal>
            </list>
        </vertical>
    </drawer>`
);

activity.setSupportActionBar(ui.toolbar);
ui.toolbar.setupWithDrawer(ui.drawer);
ui.menu.setDataSource(left_menu(selecttName));
ui.menu.on("item_click", item => {
    storage.put('name', item.name)
    storage.put('bundle', item.bundle)
    ui.menu.setDataSource(left_menu(item.name))
    ui.toolbar.setTitle(`热血壬戌 V${app.versionName} ${item.name}`)
    closeAll()
    restartApp()
})
const logLevel = new Set(['INFO', 'ERROR', 'WARN']);
ui.globalconsole.setLogFilter(function (logItem) {
    return logLevel.has(logItem.level.toString())
});

const ignoreList = new Set([
    '/data/user/0/com.zjh336.cn.tools/files/project/main.js',
    '/data/user/0/com.zjh336.cn.tools/files/project/runScript.js',
    engines.myEngine().source.toString()
])


function closeAll() {
    // 获取所有正在运行的引擎
    let allEngines = engines.all();

    // 遍历每个引擎并输出信息
    allEngines.forEach(engine => {
        if (ignoreList.has(engine.source.toString())) {
            return
        }
        engine.forceStop()
    });

    // 移除所有工作管理器中的任务
    let intentTasks = $work_manager.queryIntentTasks();
    intentTasks.forEach(task => {
        // log('removeIntentTask', task.id)
        $work_manager.removeIntentTask(task.id);
    });

    let timedTasks = $work_manager.queryTimedTasks();
    timedTasks.forEach(task => {
        // log('removeTimedTask', task.id)
        $work_manager.removeTimedTask(task.id);
    });

    // 关闭所有悬浮窗
    floaty.closeAll();
}

/**
 * 检查权限
 * @param {*} permission 
 * @returns 
 */
function checkPermission(permission) {
    let pm = context.getPackageManager();
    return PackageManager.PERMISSION_GRANTED == pm.checkPermission(permission, myPackageName.toString());
}


/**
 * 打开无障碍服务
 */
function openAccessibility() {
    // console.info("开启无障碍服务")
    let mServices = ":" + myPackageName + "/com.stardust.autojs.core.accessibility.AccessibilityService";
    let enabledServices = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES)
    enabledServices = enabledServices ? enabledServices.replace(new RegExp(mServices, "g"), "") : "";
    Settings.Secure.putString(context.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES, "");
    Settings.Secure.putString(context.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES, enabledServices + mServices);
}

/**
 * 检查无障碍服务
 */
function setAutoService() {

    if (checkPermission("android.permission.WRITE_SECURE_SETTINGS")) {
        openAccessibility();
    } else {
        if ($shell.checkAccess("root")) {
            shell("pm grant " + myPackageName + " android.permission.WRITE_SECURE_SETTINGS", {
                root: true,
            });
            openAccessibility();
        } else {
            app.startActivity({
                action: "android.settings.ACCESSIBILITY_SETTINGS",
            });
        }
    }
}


function strToArr(str) {
    if (!str) {
        return [];
    }
    //防止保活时,连环回调放入空字符,去掉末尾没用的字符串
    return str.replace(/:$/, "").split(":");
}

/**
 * 无障碍服务保活
 */
function keepAliveService() {
    try {
        console.info('开启无障碍保活')


        //保活白名单数组,也可以时其他应用的服务名,这里是autojspro的
        const whiteList = [myPackageName + "/com.stardust.autojs.core.accessibility.AccessibilityService"];
        const contentResolver = context.getContentResolver();
        let lastArr = strToArr(Settings.Secure.getString(contentResolver, "enabled_accessibility_services"));
        let contentObserver = JavaAdapter(
            ContentObserver, {
            onChange(b) {
                let service = "";
                let str = Settings.Secure.getString(contentResolver, "enabled_accessibility_services");
                let newArr = strToArr(str);
                if (newArr.length > lastArr.length) {
                    newArr.some(item => {
                        service = item;
                        return !lastArr.includes(item);
                    });
                    // console.info("开启了----", service);
                } else if (newArr.length < lastArr.length) {
                    lastArr.some(item => {
                        service = item;
                        return !newArr.includes(item);
                    });
                    //这里可以做一些保活处理
                    if (service && whiteList.includes(service)) {
                        try {
                            newArr.push(service);
                            // let success = Settings.Secure.putString(contentResolver, "enabled_accessibility_services", newArr.join(":"));
                            // console.info(`${success ? "保活成功" : "保活失败"}----${service}`);
                        } catch (error) {
                            // console.info("没有权限----", error);
                        }
                    } else {
                        // console.info("关闭了----", service);
                    }
                }
                lastArr = newArr;
            },
        },
            new Handler()
        );
        contentResolver.registerContentObserver(Settings.Secure.getUriFor("enabled_accessibility_services"), true, contentObserver);
        events.on("exit", () => {
            contentResolver.unregisterContentObserver(contentObserver);
        });
    } catch (e) {
        console.error($debug.getStackTrace(ex));
    }
}

// 开启前台服务
$settings.setEnabled('foreground_service', true);
// 关闭音量键
$settings.setEnabled('stop_all_on_volume_up', false);

if (!auto.service) {
    setAutoService();
}
keepAliveService()

try {
    $images.stopScreenCapture();
} catch (ex) {
}

// 是否获取vpn权限
const intent = VpnService.prepare(activity);
if (intent)
    activity.startActivityForResult(intent, 0)

// 重新加载
events.broadcast.on('reload', () => {
    console.info('重新加载')
    hotload()
});

ui.vpn_auth.on('click', () => {
    activity.startActivityForResult(intent, 0)
});

ui.hotload.on('click', () => {
    hotload();
})



function restartApp() {
    let workTask = $work_manager.queryIntentTasks();
    for (let i = 0; i < workTask.length; i++) {
        $work_manager.removeIntentTask(workTask[i].id);
    }

    let timerTask = $work_manager.queryTimedTasks();
    for (let i = 0; i < timerTask.length; i++) {
        $work_manager.removeTimedTask(timerTask[i].id);
    }

    // floaty.closeAll()
    // engines.stopAll();
    // let intent = context.getPackageManager()
    //     .getLaunchIntentForPackage(myPackageName);
    // intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
    // activity.startActivity(intent);
    let cmd = "PKG=" + myPackageName +
        "; ACT=$(cmd package resolve-activity --brief $PKG 2>/dev/null | tail -n 1)" +
        "; am force-stop $PKG" +
        "; sleep 0.6" +
        "; if [ -z \"$ACT\" ]; then monkey -p $PKG 1; else am start -n $ACT --activity-clear-task; fi";
    shell(cmd, true)
}

ui.reboot.on('click', () => {
    restartApp()
})

ui.console_clear.on('click', () => {
    ui.globalconsole.clear()
})
ui.setting.on('click', () => {
    dialogs.rawInput("更新地址设置", "", (upfatefile) => {
        if (upfatefile == null)
            return;

        try {
            let res = http.get('https://cdn.jsdelivr.net/gh/flux-dev2026/07c9d91d-8aae-76a4-711b-bbd4dad4d22e@main/check.md?' + Date.now());
            let auth = res.body.string().split('\n').map(item => item.trim());
            const isRealod = storage.get('upfatefile', "") != upfatefile
            if (upfatefile) {
                let check = $crypto.digest(upfatefile, "MD5")
                if (auth.includes(check))
                    storage.put('upfatefile', upfatefile)
            }
            else {
                storage.remove('upfatefile')
            }
            if (isRealod) {
                restartApp()
            }
        } catch (e) {
            // toast()
        }
    });
})

if (intent == null) {
    // vpn已授权 开始下载并运行
    hotload()
}
else {
    const timer = setInterval(() => {
        const intent = VpnService.prepare(activity);
        ui.vpn_auth.attr("visibility", intent != null ? "visible" : "gone");
        if (intent == null) {
            clearInterval(timer)
            console.clear()
            hotload()
        }
    }, 1000)
}

let isUpdating = false;
function hotload() {
    let bundle = storage.get('bundle')

    if (!bundle)
        return;

    if (isUpdating)
        return;

    isUpdating = true
    events.broadcast.emit('updating', {});

    let bundleName = bundle.split('.')[2]
    let bundlePath = files.getSdcardPath() + '/' + bundle + '/';
    let codePath = files.getSdcardPath() + '/' + bundle + '/code/';

    files.ensureDir(bundlePath);
    files.ensureDir(codePath);

    let updateFile = bundlePath + 'update.txt'

    let url = `https://124.221.255.83/rxjh/v2/${bundleName}/`;

    function forceStopScript(file, tag) {
        let workTask = $work_manager.queryIntentTasks({ path: file });
        if (workTask.length > 0) {
            console.info(`[${tag}]移除任务${workTask[0].id}`);
            $work_manager.removeIntentTask(workTask[0].id);
        }

        let timerTask = $work_manager.queryTimedTasks({ path: file });
        if (timerTask > 0) {
            console.info(`[${tag}]移除任务${workTask[0].id}`);
            $work_manager.removeTimedTask(timerTask[0].id);
        }

        engines.all().forEach(v => {
            if (v.source && v.source.toString() == file) {
                v.forceStop()
            }
        })
    }

    function forceStartScript(file) {
        let find = engines.all().find(v => {
            return v.source && v.source.toString() == file
        });
        if (!find) {
            engines.execScriptFile(file, {
                path: bundlePath
            })
        }
    }
    function downloadFile(path, file) {
        try {
            let res = http.request(`${url}${path}`, {
                method: 'GET',
            });
            if (res.statusCode === 200) {
                let bytes = res.body.bytes()
                // console.log(file)
                files.writeBytes(file, bytes);
            } else {
                console.error(`下载文件失败` + res.statusCode);
            }
        } catch (ex) {
            console.error(`下载文件失败`);
            console.error($debug.getStackTrace(ex));
        }
    }

    /**
     * 
     * @param data 
     */
    function buildAuto(data) {
        let codeScript = codePath + (data.file2 || data.file)
        let runScript = bundlePath + data.file
        let newmd5 = data.md5
        let curmd5 = files.exists(codeScript) ? $crypto.digest(codeScript, "MD5", {
            input: "file"
        }) : '';
        let runCode = `
let my = engines.myEngine();
let find = engines.all().find(v => v.source && v.source.toString() == my.source.toString() && my.id != v.id)
if(!find){
    try{
        let tasks = $work_manager.queryIntentTasks({
            path: my.source.toString(),
            action: Intent.ACTION_TIME_TICK,
        });
        let packageName = context.getPackageName()
        if (tasks.length == 0 && packageName != 'com.zjh336.cn.tools') {
            let t = $work_manager.addIntentTask({
                path: my.source.toString(),
                action: Intent.ACTION_TIME_TICK,
            })
        }
        if("${codeScript}".endsWith("dex")){
            runtime.unloadDex('${codeScript}');
            runtime.loadDex('${codeScript}');
            new Packages['${data.name}']()()
            runtime.unloadDex('${codeScript}');
        }else{
            require("${codeScript}")
        }
    }catch(ex){
        console.error(ex);
    }
}`;
        files.write(runScript, runCode);

        if (newmd5 != curmd5) {
            downloadFile(data.file2 || data.file, codeScript)
            forceStopScript(runScript, 'auto')
        }

        setTimeout(() => {
            forceStartScript(runScript)
        }, 500)
    }

    function buildNode(data) {
        let codeScript = codePath + (data.file2 || data.file)
        let runScript = bundlePath + data.file
        let newmd5 = data.md5
        let curmd5 = files.exists(codeScript) ? $crypto.digest(codeScript, "MD5", {
            input: "file"
        }) : ''

        let runCode = `"nodejs";
const engines = require('engines')
const my = engines.myEngine();
const {
    queryIntentTasks, 
    addBroadcastIntentTask
} = require("work_manager");
async function run(){
    let find = engines.getRunningEngines().find(v => v.source && v.source.toString() == my.source.toString() && my.id != v.id)
    if(!find){
        const tasks = await queryIntentTasks({ 
            path: my.source.toString(),
            action: 'android.intent.action.TIME_TICK'
        });
        const packageName = $autojs.androidContext.getPackageName()
        if (tasks.length == 0 && packageName != 'com.zjh336.cn.tools') {
            await addBroadcastIntentTask({
                path: my.source.toString(),
                action: 'android.intent.action.TIME_TICK'
            });
        }
        // =========================================================
        const vm = require('vm');
        const v8 = require('v8');
        const zlib = require('zlib');
        const fs = require('fs');
        const path = require('path');
        const Module = require('module');
        v8.setFlagsFromString('--no-lazy');
        v8.setFlagsFromString('--no-flush-bytecode');
        global.generateScript=function(cachedData, filename) {
            cachedData = zlib.brotliDecompressSync(cachedData);
            fixBytecode(cachedData);
            const length = readSourceHash(cachedData);
            let dummyCode = '';
            if (length > 1) {
                dummyCode = '"' + '\u200b'.repeat(length - 2) + '"';
            }
            const script = new vm.Script(dummyCode, {
                cachedData,
                filename
            });
            if (script.cachedDataRejected) {
                throw new Error('Invalid or incompatible cached data (cachedDataRejected)');
            }
            return script;
        }
        global.compileCode = function(javascriptCode, compress) {
            const script = new vm.Script(javascriptCode, {
                produceCachedData: true
            });
            let bytecodeBuffer = (script.createCachedData && script.createCachedData.call) ?
                script.createCachedData() :
                script.cachedData;
            if (compress) bytecodeBuffer = zlib.brotliCompressSync(bytecodeBuffer);
            return bytecodeBuffer;
        };
        global.fixBytecode = function(bytecodeBuffer) {
            const dummyBytecode = compileCode('');
            dummyBytecode.subarray(12, 16).copy(bytecodeBuffer, 12);
        };
        global.readSourceHash = function(bytecodeBuffer) {
            return bytecodeBuffer.subarray(8, 12).reduce((sum, number, power) => sum += number * Math.pow(256, power), 0);
        };
        try {
            Module._extensions['.jsc'] = function(fileModule, filename) {
                const data = fs.readFileSync(filename, 'utf8')
                const bytecodeBuffer = Buffer.from(data, 'base64');
                const script = generateScript(bytecodeBuffer, filename);

                function require(id) {
                    return fileModule.require(id);
                }
                require.resolve = function(request, options) {
                    return Module._resolveFilename(request, fileModule, false, options);
                };
                if (process.main) {
                    require.main = process.main;
                }
                require.extensions = Module._extensions;
                require.cache = Module._cache;
                const compiledWrapper = script.runInThisContext({
                    filename: filename,
                    lineOffset: 0,
                    columnOffset: 0,
                    displayErrors: true
                });
                const dirname = path.dirname(filename);
                const args = [
                    fileModule.exports, require, fileModule, filename, dirname, process, global
                ];
                return compiledWrapper.apply(fileModule.exports, args);
            };
        } catch (ex) {
            console.error('xrequire:' + ex.message);
        }
        require("${codeScript}")
    }
}
// setTimeout(()=>{
    run().catch(ex=>console.error(ex))
// },1000)`;
        files.write(runScript, runCode);

        if (newmd5 != curmd5) {
            downloadFile(data.file2 || data.file, codeScript)
            forceStopScript(runScript, 'auto')
        }

        setTimeout(() => {
            forceStartScript(runScript)
        }, 1000)
    }

    function buildNone(data) {
        let codeScript = bundlePath + (data.file2 || data.file)
        let newmd5 = data.md5
        let curmd5 = files.exists(codeScript) ? $crypto.digest(codeScript, "MD5", {
            input: "file"
        }) : ''
        if (newmd5 != curmd5) {
            downloadFile(data.file2 || data.file, codeScript)
        }
    }

    function buildMain(data) {

    }

    function buildVersion(data) {
        if (version != data.version) {
            restartApp()
        }
    }

    function buildCode(data) {
        switch (data.type) {
            case "auto": {
                buildAuto(data)
                break;
            }
            case "node": {
                buildNode(data)
                break;
            }
            case "none": {
                buildNone(data)
                break;
            }
            case "main": {
                buildMain(data)
                break;
            }
            case "version": {
                buildVersion(data)
                break;
            }
        }
    }

    function local() {
        if (files.exists(updateFile)) {
            let txt = files.read(updateFile);
            let body = JSON.parse(txt);
            (body || []).forEach(v => buildCode(v))
        }
    }

    function download() {
        console.info('检查更新')
        try {
            // console.log(url + (isArm32 ? 'arm32/' : 'arm64/') + 'update.txt')
            http.get(url + (isArm32 ? 'arm32/' : 'arm64/') + 'update.txt' + '?a=' + device.getAndroidId() + '&t=' + Date.now(), {}, function (res, err) {
                try {
                    if (err) {
                        local()
                        toast('更新失败')
                    } else {
                        if (res.statusCode == 200) {

                            let txt = res.body.string();
                            files.write(updateFile, txt);
                            toast('更新完成')
                        } else {
                            toast('更新失败')
                        }
                        isUpdating = false;
                        local()
                    }
                } catch (ex) {
                    toast('更新失败')
                    local()
                    console.error($debug.getStackTrace(ex));
                }
            });
        } catch (ex) {
            toast('更新失败')
            local()
            console.error($debug.getStackTrace(ex));
        }
    }

    download();
}

events.broadcast.on('hotload', hotload)
