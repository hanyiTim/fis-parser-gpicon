/**
 * 需要配置的参数有{
 *     isuse                            //是否开启
 *     prefix                           //识别图片前缀 例如: icon_xx-xx_xx_xx,或者 gpicon_xx-xx_xx_xx
 *     relative_icon_path
 *     图片命名格式：                    //icon_($name:xxx-xxx-xxx 只能用中线间隔)_$width_$height_[h|v]_[ns(no_sprite)].png
 * }
 */
var fs=require("fs");
var path=require("path");
var cache_obj={};

var fgp_gpicon=fis.config.get("fgp_gpicon") || {},
    fgp_prefix=fgp_gpicon.prefix || "gpicon",
    fgp_relative_icon_path=fgp_gpicon.relative_icon_path || "i";


module.exports = function (content, file, settings) {
    // 你在此处设置你的逻辑修改文件内容 content，或者文件对象 file

    var sass_arr=[];
    var icon_obj={};
    var file_dirname=file.dirname;
    var icon_dir=path.join(file_dirname,fgp_relative_icon_path);

    var get_icon_sass=function(opt){
        opt=Object.assign({hover:false,acitve:false},opt);
        if(!opt.name || isNaN(opt.width) || isNaN(opt.height)){
            fis.log.error("name or width or height error");
        };
        var str=".gp_icon_"+opt.name+"{\n    @include icon('"+opt.name+"',resize("+opt.width+"px),resize("+opt.height+"px),"+opt.hover+","+opt.acitve+",$no_sprite:"+opt.no_sprite+",$dir:'i')\n}\n";
        return str;
    };
    if(fis.util.isDir(icon_dir) && fgp_gpicon && fgp_gpicon.isuse){
        var fs_readdir=fs.readdirSync(icon_dir);
        fs_readdir.forEach(function(filename){
            var str,arr,obj,wh,other;
            if((new RegExp("^"+fgp_prefix,"gi")).test(filename)){
                str=filename.substr(0,filename.lastIndexOf("."));
                arr=str.split("_");
                wh=arr[2].split("x");
                other=arr.slice(3).join(",");
                obj={
                    name:str.replace(/\_h$/,""),
                    width:wh[0],
                    height:wh[1],
                    hover:/\,?h\,?/g.test(other)?true:false,
                    active:/\,?a\,?/g.test(other)?true:false,
                    no_sprite:/\,ns\,/g.test(other)?true:false
                };

                if(!icon_obj[str.replace(/\_h$/,"")]){
                    icon_obj[str.replace(/\_h$/,"")]=obj;
                }else{
                    icon_obj[str.replace(/\_h$/,"")]=Object.assign(icon_obj[str.replace(/\_h$/,"")],obj);
                }
            }
        });
        if((Object.keys(icon_obj)).length>0){
            sass_arr.push("/*start*/\n");
            for(var k in icon_obj){
                if(!cache_obj[k]){//处理hover，active icon 问题
                    sass_arr.push(get_icon_sass(icon_obj[k]));
                }
            }
            sass_arr.push("/*end*/\n");
            if(/\/\*start\*\/(.|\n)*?\/\*end\*\//gi.test(content)){
                content=content.replace(/\/\*start\*\/(.|\n)*?\/\*end\*\//gi,"");
            }
            content=content+sass_arr.join("");
            //return content 只是返回内容到 release 的文件里面，对于scss文件并没有做修改，这样没办法看到class的 name
            fis.util.write(file.fullname,content);
        }
    }
    return content;
};
