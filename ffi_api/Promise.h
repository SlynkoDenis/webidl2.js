#include <functional>

#include "napi/native_api.h"
#include "napi/native_node_api.h"

namespace ffi {

class _Env;
using Env = _Env*;

template <typename T>
class Array;

template <typename T>
class Deferred;

template <typename T>
class Promise {
public:
    template <typename U>
    Promise<U> Then(Env env, std::function<U(T &&)> func)
    {
        // napi_create_promise(env, &(deferred), &(result));
    }

    std::pair<Deferred<T>, Promise> New();
};

}   // namespace ffi

namespace user_code {

// From generated code
class Album;
class FileAsset;

class DeletePhotoAssetsTask : public ffi::AsyncTask {
public:
    explicit DeletePhotoAssetsTask(ffi::Env env, ffi::Array<FileAsset> assets);

    // void Schedule(ffi::Env env, ffi::Deferred<void> &&deferred);
};

class Album_Native : public Album {
public:
    virtual ffi::Promise<void> deletePhotoAssets(ffi::Array<FileAsset> assets) {
        auto [deferred, promise] = ffi::Promise<void>::New();
        DeletePhotoAssetsTask(assets).Schedule(env, std::move(deferred));
        return promise;
    }
}

}   // namespace user_code

/*
interface Album: AbsAlbum {
    deletePhotoAssets(assets: Array<FileAsset>): Promise<void>;
}
*/
